import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    title: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');

        this.createFallingBricks(); // Create bricks first

        this.title = this.add.text(0, 460, 'Block Pop', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5, 0.5).setStyle({ wordWrap: { width: 1024 } });

        // Center the title vertically
        this.title.setPosition(this.cameras.main.centerX, this.cameras.main.centerY);

        // Animate the title using tweens for scaling and rotation
        this.tweens.add({
            targets: this.title,
            scaleX: 1.2,
            scaleY: 1.2,
            angle: 360,
            duration: 3000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Rainbow color effect
        this.tweens.add({
            targets: this.title,
            tint: { start: 0xff0000, to: 0x0000ff }, // From red to blue
            duration: 3000,
            ease: 'Linear',
            repeat: -1,
            yoyo: true
        });

        this.input.once('pointerdown', () => {
            this.scene.start('Game');
        });
    }

    private createFallingBricks() {
        const brickCount = 50; // Increase the number of bricks for a fuller screen
        for (let i = 0; i < brickCount; i++) {
            const brickColor = Phaser.Display.Color.RandomRGB(); // Generate a random color
            const brick = this.add.rectangle(
                Phaser.Math.Between(0, 1024),
                Phaser.Math.Between(-100, -50),
                80,
                20,
                Phaser.Display.Color.GetColor(brickColor.r, brickColor.g, brickColor.b) // Set the random color
            ).setOrigin(0.5).setAlpha(0.5); // Set lower opacity

            // Randomize the falling speed
            const fallSpeed = Phaser.Math.Between(3000, 7000); // Random duration for falling

            this.tweens.add({
                targets: brick,
                y: 800,
                duration: fallSpeed,
                ease: 'Linear',
                repeat: -1,
                onComplete: () => {
                    brick.y = Phaser.Math.Between(-100, -50); // Reset position
                    brick.x = Phaser.Math.Between(0, 1024); // Random x position
                }
            });
        }
    }
}
