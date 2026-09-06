# Importer le module Windows Forms
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Fonction pour afficher une boîte de message
function Show-Message {
    param (
        [string]$Message,
        [string]$Title = "Information"
    )
    [System.Windows.Forms.MessageBox]::Show($Message, $Title, [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
}

# Fonction pour afficher le menu principal
function Show-MainMenu {
    $form = New-Object System.Windows.Forms.Form
    $form.Text = "Gestionnaire de Tâches Planifiées"
    $form.Size = New-Object System.Drawing.Size(400, 300)
    $form.StartPosition = "CenterScreen"

    # Boutons pour chaque fonctionnalité
    $btnAdd = New-Object System.Windows.Forms.Button
    $btnAdd.Text = "Ajouter une Tâche"
    $btnAdd.Size = New-Object System.Drawing.Size(150, 40)
    $btnAdd.Location = New-Object System.Drawing.Point(125, 50)

    $btnView = New-Object System.Windows.Forms.Button
    $btnView.Text = "Afficher les Tâches"
    $btnView.Size = New-Object System.Drawing.Size(150, 40)
    $btnView.Location = New-Object System.Drawing.Point(125, 100)

    $btnDelete = New-Object System.Windows.Forms.Button
    $btnDelete.Text = "Supprimer une Tâche"
    $btnDelete.Size = New-Object System.Drawing.Size(150, 40)
    $btnDelete.Location = New-Object System.Drawing.Point(125, 150)

    $btnExit = New-Object System.Windows.Forms.Button
    $btnExit.Text = "Quitter"
    $btnExit.Size = New-Object System.Drawing.Size(150, 40)
    $btnExit.Location = New-Object System.Drawing.Point(125, 200)

    # Actions des boutons
    $btnAdd.Add_Click({ $form.Close(); Show-AddTask })
    $btnView.Add_Click({ $form.Close(); Show-ViewTasks })
    $btnDelete.Add_Click({ $form.Close(); Show-DeleteTask })
    $btnExit.Add_Click({ $form.Close() })

    # Ajouter les boutons à la fenêtre
    $form.Controls.Add($btnAdd)
    $form.Controls.Add($btnView)
    $form.Controls.Add($btnDelete)
    $form.Controls.Add($btnExit)

    # Afficher la fenêtre
    $form.ShowDialog()
}

# Fonction pour ajouter une tâche planifiée
function Show-AddTask {
    $form = New-Object System.Windows.Forms.Form
    $form.Text = "Ajouter une Tâche Planifiée"
    $form.Size = New-Object System.Drawing.Size(400, 300)
    $form.StartPosition = "CenterScreen"

    # Labels et champs de texte
    $lblName = New-Object System.Windows.Forms.Label
    $lblName.Text = "Nom de la Tâche :"
    $lblName.Location = New-Object System.Drawing.Point(20, 20)

    $txtName = New-Object System.Windows.Forms.TextBox
    $txtName.Location = New-Object System.Drawing.Point(150, 20)
    $txtName.Size = New-Object System.Drawing.Size(200, 20)

    $lblProgram = New-Object System.Windows.Forms.Label
    $lblProgram.Text = "Programme :"
    $lblProgram.Location = New-Object System.Drawing.Point(20, 60)

    $txtProgram = New-Object System.Windows.Forms.TextBox
    $txtProgram.Location = New-Object System.Drawing.Point(150, 60)
    $txtProgram.Size = New-Object System.Drawing.Size(200, 20)

    $lblTime = New-Object System.Windows.Forms.Label
    $lblTime.Text = "Horaire (HH:mm AM/PM) :"
    $lblTime.Location = New-Object System.Drawing.Point(20, 100)

    $txtTime = New-Object System.Windows.Forms.TextBox
    $txtTime.Location = New-Object System.Drawing.Point(150, 100)
    $txtTime.Size = New-Object System.Drawing.Size(200, 20)

    # Boutons
    $btnSubmit = New-Object System.Windows.Forms.Button
    $btnSubmit.Text = "Ajouter"
    $btnSubmit.Location = New-Object System.Drawing.Point(150, 150)

    $btnBack = New-Object System.Windows.Forms.Button
    $btnBack.Text = "Retour"
    $btnBack.Location = New-Object System.Drawing.Point(250, 150)

    # Actions des boutons
    $btnSubmit.Add_Click({
        Ajouter-TachePlanifiee -NomTache $txtName.Text -Programme $txtProgram.Text -Horaire $txtTime.Text
        Show-Message "Tâche ajoutée avec succès."
        $form.Close(); Show-MainMenu
    })

    $btnBack.Add_Click({ $form.Close(); Show-MainMenu })

    # Ajouter les composants à la fenêtre
    $form.Controls.Add($lblName)
    $form.Controls.Add($txtName)
    $form.Controls.Add($lblProgram)
    $form.Controls.Add($txtProgram)
    $form.Controls.Add($lblTime)
    $form.Controls.Add($txtTime)
    $form.Controls.Add($btnSubmit)
    $form.Controls.Add($btnBack)

    # Afficher la fenêtre
    $form.ShowDialog()
}

# Fonction pour afficher les tâches planifiées
function Show-ViewTasks {
    $form = New-Object System.Windows.Forms.Form
    $form.Text = "Afficher les Tâches Planifiées"
    $form.Size = New-Object System.Drawing.Size(500, 400)
    $form.StartPosition = "CenterScreen"

    # Champ de texte pour afficher les résultats
    $txtResults = New-Object System.Windows.Forms.TextBox
    $txtResults.Multiline = $true
    $txtResults.ScrollBars = "Vertical"
    $txtResults.Size = New-Object System.Drawing.Size(450, 300)
    $txtResults.Location = New-Object System.Drawing.Point(20, 20)
    $txtResults.ReadOnly = $true

    $btnBack = New-Object System.Windows.Forms.Button
    $btnBack.Text = "Retour"
    $btnBack.Location = New-Object System.Drawing.Point(200, 330)

    # Action pour le bouton Retour
    $btnBack.Add_Click({ $form.Close(); Show-MainMenu })

    # Charger les tâches planifiées
    $txtResults.Text = (Show-ViewTasks)

    # Ajouter les composants à la fenêtre
    $form.Controls.Add($txtResults)
    $form.Controls.Add($btnBack)

    # Afficher la fenêtre
    $form.ShowDialog()
}

# Fonction pour supprimer une tâche planifiée
function Show-DeleteTask {
    $form = New-Object System.Windows.Forms.Form
    $form.Text = "Supprimer une Tâche Planifiée"
    $form.Size = New-Object System.Drawing.Size(400, 200)
    $form.StartPosition = "CenterScreen"

    # Labels et champs de texte
    $lblName = New-Object System.Windows.Forms.Label
    $lblName.Text = "Nom de la Tâche :"
    $lblName.Location = New-Object System.Drawing.Point(20, 20)

    $txtName = New-Object System.Windows.Forms.TextBox
    $txtName.Location = New-Object System.Drawing.Point(150, 20)
    $txtName.Size = New-Object System.Drawing.Size(200, 20)

    $btnSubmit = New-Object System.Windows.Forms.Button
    $btnSubmit.Text = "Supprimer"
    $btnSubmit.Location = New-Object System.Drawing.Point(150, 60)

    $btnBack = New-Object System.Windows.Forms.Button
    $btnBack.Text = "Retour"
    $btnBack.Location = New-Object System.Drawing.Point(250, 60)

    # Actions des boutons
    $btnSubmit.Add_Click({
        Supprimer-TachePlanifiee -NomTache $txtName.Text
        Show-Message "Tâche supprimée avec succès."
        $form.Close(); Show-MainMenu
    })

    $btnBack.Add_Click({ $form.Close(); Show-MainMenu })

    # Ajouter les composants à la fenêtre
    $form.Controls.Add($lblName)
    $form.Controls.Add($txtName)
    $form.Controls.Add($btnSubmit)
    $form.Controls.Add($btnBack)

    # Afficher la fenêtre
    $form.ShowDialog()
}

# Exécution de l'application
Show-MainMenu
