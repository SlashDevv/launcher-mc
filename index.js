// Importation des modules
const { Client, Authenticator } = require("minecraft-launcher-core")
const { app, BrowserWindow, ipcMain } = require("electron")
const launcher = new Client();
const path = require('path')

// Variables globales
let mainWindow

// Fonction pour créer la fenêtre
function createWindow() {
    mainWindow = new BrowserWindow({
        frame: false,
        title: "Launcher MC",
        icon: "asset/icon.png",
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })

    mainWindow.loadURL(path.join(__dirname, 'index.html'))
}

// Lorsque l'application est prête
app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Lorsque toutes les fenêtres sont fermées.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

// Lors de la connexion
ipcMain.on("login", (event, data) => {
    // Tente de se connecter à Mojang
    // Si vous voulez vous co en crack, retirez cette promesse js
    Authenticator.getAuth(data.pseudo, data.passwd).then(() => {
        // Connecté
        event.sender.send("connexion")

        // Options de lancement
        let opts = {
            clientPackage: null,
            // Si vous voulez vous co en crack:
            // Authenticator.getAuth("pseudo")
            authorization: Authenticator.getAuth(data.pseudo, data.passwd),
            root: path.join(app.getPath("appData"), "/.launchmc/"),
            version: {
                number: "1.12.2",
                type: "release"
            },
            forge: path.join(app.getPath("appData"), "/.launchmc/forge.jar"),
            memory: {
                max: "6000",
                min: "4000"
            }
        }

        // Lancement du jeu
        launcher.launch(opts);

        // Progression
        launcher.on('debug', (e) => console.log(e));
        launcher.on('data', (e) => { console.log(e); mainWindow.hide() });
        launcher.on('close', (e) => app.quit());
        launcher.on('progress', (e) => {
            event.sender.send("progression", e)
        })
    }).catch(() => {
        // Erreur de connexion
        event.sender.send("errco")
    })
})