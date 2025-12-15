import Player from './Player.js'
import InputHandler from './InputHandler.js'
import Platform from './Platform.js'
import Coin from './Coin.js'
import UserInterface from './UserInterface.js'

export default class Game {
    constructor(width, height) {
        this.width = width
        this.height = height

        // Fysik
        this.gravity = 0.001 // pixels per millisekund^2
        this.friction = 0.00015 // luftmotstånd för att bromsa fallhastighet

        // Game state
        this.score = 0
        this.coinsCollected = 0

        this.inputHandler = new InputHandler(this)
        this.ui = new UserInterface(this)

        this.player = new Player(this, 50, 50, 50, 50, 'green')

        // Skapa plattformar för nivån
        this.platforms = [
            // Marken
            new Platform(this, 0, this.height - 40, this.width, 40, '#654321'),
            
            // Plattformar
            new Platform(this, 150, this.height - 140, 150, 20, '#8B4513'),
            new Platform(this, 400, this.height - 200, 120, 20, '#8B4513'),
            new Platform(this, 100, this.height - 280, 100, 20, '#8B4513'),
            new Platform(this, 550, this.height - 160, 100, 20, '#8B4513'),
            new Platform(this, 350, this.height - 320, 140, 20, '#8B4513'),
        ]

        // Skapa mynt i nivån
        this.coins = [
            new Coin(this, 200, this.height - 180, 15, 10),
            new Coin(this, 240, this.height - 180, 20, 20),
            new Coin(this, 450, this.height - 240, 15, 10),
            new Coin(this, 150, this.height - 320, 15, 10),
            new Coin(this, 190, this.height - 320, 20, 20),
            new Coin(this, 600, this.height - 200, 15, 10),
            new Coin(this, 380, this.height - 360, 15, 10),
            new Coin(this, 420, this.height - 360, 20, 20),
        ]

        // Skapa andra objekt i spelet (valfritt)
        this.gameObjects = []
    }

    update(deltaTime) {
        
        // Uppdatera alla spelobjekt
        this.gameObjects.forEach(obj => obj.update(deltaTime))
        
        // Uppdatera plattformar (även om de är statiska)
        this.platforms.forEach(platform => platform.update(deltaTime))
        
        // Uppdatera mynt
        this.coins.forEach(coin => coin.update(deltaTime))
        
        // Uppdatera spelaren
        this.player.update(deltaTime)

        // Antag att spelaren inte står på marken, tills vi hittar en kollision
        this.player.isGrounded = false

        // Kontrollera kollisioner med plattformar
        this.platforms.forEach(platform => {
            const collision = this.player.getCollisionData(platform)
            
            if (collision) {
                if (collision.direction === 'top' && this.player.velocityY > 0) {
                    // Kollision från ovan - spelaren landar på plattformen
                    this.player.y = platform.y - this.player.height
                    this.player.velocityY = 0
                    this.player.isGrounded = true
                } else if (collision.direction === 'bottom' && this.player.velocityY < 0) {
                    // Kollision från nedan - spelaren träffar huvudet
                    this.player.y = platform.y + platform.height
                    this.player.velocityY = 0
                } else if (collision.direction === 'left' && this.player.velocityX > 0) {
                    // Kollision från vänster
                    this.player.x = platform.x - this.player.width
                } else if (collision.direction === 'right' && this.player.velocityX < 0) {
                    // Kollision från höger
                    this.player.x = platform.x + platform.width
                }
            }
        })

        // Kontrollera kollision med mynt
        this.coins.forEach(coin => {
            if (this.player.intersects(coin) && !coin.markedForDeletion) {
                // Plocka upp myntet
                this.score += coin.value
                this.coinsCollected++
                coin.markedForDeletion = true
            }
        })
        
        // Ta bort alla objekt markerade för borttagning
        this.coins = this.coins.filter(coin => !coin.markedForDeletion)

        // Förhindra att spelaren går utöver skärmen horisontellt
        if (this.player.x < 0) {
            this.player.x = 0
        }
        if (this.player.x + this.player.width > this.width) {
            this.player.x = this.width - this.player.width
        }
    }

    draw(ctx) {
        // Rita alla plattformar
        this.platforms.forEach(platform => platform.draw(ctx))
        
        // Rita mynt
        this.coins.forEach(coin => coin.draw(ctx))
        
        // Rita andra spelobjekt
        this.gameObjects.forEach(obj => obj.draw(ctx))
        
        // Rita spelaren
        this.player.draw(ctx)
        
        // Rita UI sist (så det är överst)
        this.ui.draw(ctx)
    }
}