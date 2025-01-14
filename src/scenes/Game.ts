import { Scene } from 'phaser';
import { blockTypes } from '../data/blocks'; // Import the block types

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
    private playerMoney: number = 0; // Add a variable to track player money
    private moneyText: Phaser.GameObjects.Text; // Text object to display money

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

        // Initialize money display
        this.moneyText = this.add.text(16, 16, `💰 Money: ${this.playerMoney}`, {
            fontSize: '20px',
            fill: '#ffffff'
        });

        // Create blocks using the block types
        this.blocks = [];
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 8; j++) {
                const blockType = blockTypes[(i * 8 + j) % blockTypes.length]; // Cycle through block types
                const block = this.add.rectangle(
                    164 + j * 100,
                    100 + i * 30,
                    80,
                    20,
                    blockType.color
                );
                block.setData('hp', blockType.hp); // Store HP in block data
                block.setData('totalHP', blockType.hp); // Store total HP in block data
                this.physics.add.existing(block, true);
                this.blocks.push(block);

                // Create text to display HP
                const hpText = this.add.text(block.x, block.y, blockType.hp.toString(), {
                    fontSize: '16px',
                    fill: '#ffffff'
                }).setOrigin(0.5); // Center the text

                // Store the text object in the block's data
                block.setData('hpText', hpText);
            }
        }

        // Add colliders
        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, undefined, this);
        
        this.blocks.forEach(block => {
            this.physics.add.collider(this.ball, block, () => {
                const currentHP = block.getData('hp');
                const totalHP = block.getData('totalHP'); // Get the total HP of the block
                if (currentHP > 0) {
                    const newHP = currentHP - 1; // Reduce HP by 1
                    block.setData('hp', newHP); // Update HP in block data
                    
                    // Update the text to reflect the new HP
                    const hpText = block.getData('hpText');
                    hpText.setText(newHP.toString());

                    if (newHP <= 0) {
                        // Update player money when block is destroyed using total HP
                        this.playerMoney += totalHP; // Add total HP to player money
                        this.moneyText.setText(`💰 Money: ${this.playerMoney}`); // Update money display

                        block.destroy(); // Destroy block if HP is 0
                        hpText.destroy(); // Destroy the text object
                        const index = this.blocks.indexOf(block);
                        if (index > -1) {
                            this.blocks.splice(index, 1);
                        }
                    }
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
