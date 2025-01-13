import { Scene } from 'phaser';

export class Game extends Scene {
    private paddle: Phaser.GameObjects.Rectangle;
    private ball: Phaser.GameObjects.Arc;
    private blocks: Phaser.GameObjects.Rectangle[];
    private ballSpeed: number = 300;
    private ballVelocity = { x: 0, y: 0 };
    private gameStarted: boolean = false;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private paddleSpeed: number = 500;
    private keys: {
        A: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    };

    constructor() {
        super('Game');
    }

    create() {
        // Create paddle
        this.paddle = this.add.rectangle(512, 700, 100, 20, 0x00ff00);
        this.physics.add.existing(this.paddle);
        
        // Set paddle physics properties
        const paddleBody = this.paddle.body as Phaser.Physics.Arcade.Body;
        paddleBody.setCollideWorldBounds(true);
        paddleBody.setImmovable(true);
        paddleBody.allowGravity = false;

        // Create ball
        this.ball = this.add.circle(512, 680, 10, 0xffffff);
        this.physics.add.existing(this.ball);

        // Set ball physics properties
        const ballBody = this.ball.body as Phaser.Physics.Arcade.Body;
        ballBody.setCollideWorldBounds(true);
        ballBody.setBounce(1, 1);
        ballBody.onWorldBounds = true;
        ballBody.allowGravity = false;

        // Setup input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            A: Phaser.Input.Keyboard.KeyCodes.A,
            D: Phaser.Input.Keyboard.KeyCodes.D
        }) as { A: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };

        // Create blocks
        this.blocks = [];
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 8; j++) {
                const block = this.add.rectangle(
                    164 + j * 100,
                    100 + i * 30,
                    80,
                    20,
                    0xff0000
                );
                this.physics.add.existing(block, true);
                this.blocks.push(block);
            }
        }

        // Add colliders
        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, undefined, this);
        
        this.blocks.forEach(block => {
            this.physics.add.collider(this.ball, block, () => {
                block.destroy();
                const index = this.blocks.indexOf(block);
                if (index > -1) {
                    this.blocks.splice(index, 1);
                }
            }, undefined, this);
        });

        // Mouse/touch input handling
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            const paddleBody = this.paddle.body as Phaser.Physics.Arcade.Body;
            paddleBody.x = Phaser.Math.Clamp(pointer.x - this.paddle.width / 2, 0, 1024 - this.paddle.width);
        });

        // Start game on click
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (!this.gameStarted) {
                this.startBall();
            }

            // Move paddle based on pointer position
            const paddleBody = this.paddle.body as Phaser.Physics.Arcade.Body;
            if (pointer.x < this.cameras.main.width / 2) {
                paddleBody.setVelocityX(-this.paddleSpeed); // Move left
            } else {
                paddleBody.setVelocityX(this.paddleSpeed); // Move right
            }
        });

        // Game over condition
        this.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body, up: boolean, down: boolean) => {
            if (down && body === ballBody) {
                this.gameStarted = false; // Reset gameStarted flag
                this.scene.start('GameOver');
            }
        });
    }

    private startBall() {
        if (!this.gameStarted) {
            this.gameStarted = true;
            const ballBody = this.ball.body as Phaser.Physics.Arcade.Body;
            // Reset ball position to paddle
            ballBody.x = this.paddle.x;
            ballBody.y = this.paddle.y - 20; // Position it above the paddle
            const angle = Phaser.Math.Between(-45, 45);
            const velocity = this.physics.velocityFromAngle(angle - 90, this.ballSpeed);
            ballBody.setVelocity(velocity.x, velocity.y);
        }
    }

    private hitPaddle(ball: Phaser.GameObjects.Arc, paddle: Phaser.GameObjects.Rectangle) {
        const ballBody = ball.body as Phaser.Physics.Arcade.Body;
        const paddleBody = paddle.body as Phaser.Physics.Arcade.Body;

        // Calculate relative position of ball to paddle
        const diff = ballBody.x - paddleBody.x;
        const angle = (diff / paddle.width) * 60; // -60 to 60 degrees
        const velocity = this.physics.velocityFromAngle(angle - 90, this.ballSpeed);
        ballBody.setVelocity(velocity.x, velocity.y);
    }

    update(time: number, delta: number) {
        if (!this.gameStarted) {
            const ballBody = this.ball.body as Phaser.Physics.Arcade.Body;
            ballBody.x = this.paddle.x;
        }

        // Handle keyboard input
        const paddleBody = this.paddle.body as Phaser.Physics.Arcade.Body;
        paddleBody.setVelocityX(0); // Reset velocity

        // Check mouse position for paddle movement
        if (this.input.activePointer.isDown) {
            if (this.input.x < this.cameras.main.width / 2) {
                paddleBody.setVelocityX(-this.paddleSpeed); // Move left
            } else {
                paddleBody.setVelocityX(this.paddleSpeed); // Move right
            }
        }

        if (this.cursors.left.isDown || this.keys.A.isDown) {
            paddleBody.setVelocityX(-this.paddleSpeed);
        }
        else if (this.cursors.right.isDown || this.keys.D.isDown) {
            paddleBody.setVelocityX(this.paddleSpeed);
        }

        // Check win condition
        if (this.blocks.length === 0) {
            this.scene.start('GameOver');
        }
    }
}
