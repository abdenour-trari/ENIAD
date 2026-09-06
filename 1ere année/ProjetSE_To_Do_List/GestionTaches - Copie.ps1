# Definir le chemin du fichier de log pour enregistrer les actions liees aux taches planifiees
$LogFilePath = "C:\Users\ATRARI\Desktop\ENIAD\ProjetSE_To_Do_List\TaskLog.txt"

# Verifier si le fichier de log existe, sinon, le creer
if (-not (Test-Path $LogFilePath)) {
    New-Item -ItemType File -Path $LogFilePath -Force | Out-Null
}

# Fonction pour creer une tache planifiee
function Ajouter-TachePlanifiee {
    param (
        # Nom de la tache
        [string]$NomTache,
        # Programme a executer
        [string]$Programme,
        # Horaire d'execution
        [string]$Horaire
    )
    try {
        # Ajouter un prefixe au nom de la tache pour identifier celles creees par l'utilisateur
        $NomTache = "TacheUtilisateur_" + $NomTache
        # Creer une action pour executer le programme
        $Action = New-ScheduledTaskAction -Execute $Programme
        # Definir le declencheur quotidien avec l'horaire specifie
        $Trigger = New-ScheduledTaskTrigger -Daily -At $Horaire
        # Enregistrer la tache planifiee
        Register-ScheduledTask -Action $Action -Trigger $Trigger -TaskName $NomTache -Force

        # Enregistrer un message de succès dans le fichier de log
        "[$(Get-Date)] - Tache '$NomTache' ajoutee pour $Programme a $Horaire." | Out-File -FilePath $LogFilePath -Append
        # Afficher un message de confirmation a l'utilisateur
        Write-Host "Tache ajoutee avec succes."
    } catch {
        # Afficher un message d'erreur et l'enregistrer dans le fichier de log
        Write-Host "Erreur lors de l'ajout de la tache : $_"
        "[$(Get-Date)] - Erreur lors de l'ajout de la tache '$NomTache': $_" | Out-File -FilePath $LogFilePath -Append
    }
}

# Fonction pour afficher uniquement les taches planifiees creees par l'utilisateur
function Afficher-TachesPlanifiees {
    try {
        # Filtrer les taches planifiees par leur nom (prefixe par "TacheUtilisateur_")
        $UserTasks = Get-ScheduledTask | Where-Object {$_.TaskName -like "TacheUtilisateur_*"}

        # Afficher les taches s'il y en a, sinon afficher un message d'absence
        if ($UserTasks) {
            $UserTasks | Select-Object TaskName, State, NextRunTime | Format-Table -AutoSize | Out-String
        } else {
            "Aucune tache planifiee trouvee pour l'utilisateur."
        }
    } catch {
        # Afficher un message en cas d'erreur
        "Erreur lors de la recuperation des taches : $_"
    }
}

# Fonction pour afficher un menu avec des programmes predefinis
function Choisir-Programme {
    Write-Host ""
    Write-Host "===== LISTE DES PROGRAMMES PReDeFINIS =====" -ForegroundColor Cyan
    Write-Host "1. Bloc-notes"
    Write-Host "2. Figma"
    Write-Host "3. Google Chrome"
    Write-Host "4. IntelliJ IDEA"
    Write-Host "5. PyCharm"
    Write-Host "6. NetBeans"
    Write-Host "7. CodeBlocks"
    Write-Host "8. VS Code"
    Write-Host "9. Autre (entrez le chemin manuellement)"
    $Choix = Read-Host "Selectionnez un programme (1-9)"

    # Retourner le chemin ou le programme correspondant a l'option choisie
    switch ($Choix) {
        "1" { return "notepad" }
        "2" { return "figma" }
        "3" { return "chrome" }
        "4" { return "idea64" }
        "5" { return "pycharm64" }
        "6" { return "netbeans64" }
        "7" { return "codeblocks" }
        "8" { return "code" }
        "9" {
            # Demander un chemin personnalise si l'utilisateur choisit "Autre"
            return (Read-Host "Entrez le chemin complet de l'executable (ex : C:\Chemin\Programme.exe)")
        }
        default {
            # Redemander en cas d'option invalide
            Write-Host "Option invalide. Reessayez." -ForegroundColor Red
            return Choisir-Programme
        }
    }
}

# Fonction pour supprimer une tache planifiee
function Supprimer-TachePlanifiee {
    try {
        # Recuperer les taches creees par l'utilisateur
        $UserTasks = Get-ScheduledTask | Where-Object {$_.TaskName -like "TacheUtilisateur_*"}
        
        if ($UserTasks) {
            # Afficher les taches disponibles
            $UserTasks | Format-Table TaskName, State, NextRunTime
            $NomTacheSansPrefixe = Read-Host "Entrez le nom exact de la tache a supprimer (sans 'TacheUtilisateur_') : "
            
            # Ajouter le prefixe 'TacheUtilisateur_'
            $NomTache = "TacheUtilisateur_" + $NomTacheSansPrefixe
            
            # Verifier si la tache existe
            $Tache = $UserTasks | Where-Object {$_.TaskName -eq $NomTache}
            if ($Tache) {
                # Supprimer la tache planifiee
                Unregister-ScheduledTask -TaskName $NomTache -Confirm:$false
                # Enregistrer un message de suppression dans le fichier de log
                "[$(Get-Date)] - Tache '$NomTache' supprimee." | Out-File -FilePath $LogFilePath -Append
                Write-Host "Tache '$NomTache' supprimee avec succes." -ForegroundColor Green
            } else {
                # Afficher un message si la tache n'est pas trouvee
                Write-Host "Tache '$NomTache' introuvable." -ForegroundColor Yellow
            }
        } else {
            # Message si aucune tache utilisateur n'existe
            Write-Host "Aucune tache planifiee trouvee pour l'utilisateur." -ForegroundColor Yellow
        }
    } catch {
        # Afficher un message en cas d'erreur
        Write-Host "Erreur lors de la suppression de la tache : $_" -ForegroundColor Red
        "[$(Get-Date)] - Erreur lors de la suppression de la tache '$NomTache': $_" | Out-File -FilePath $LogFilePath -Append
    }
}

# Fonction pour afficher et gerer le menu principal
function Menu-Principal {
    while ($true) {
        Write-Host ""
        Write-Host "========== MENU PRINCIPAL ==========" -ForegroundColor Yellow
        Write-Host "1. Ajouter une tache planifiee"
        Write-Host "2. Afficher les taches planifiees"
        Write-Host "3. Supprimer une tache planifiee"
        Write-Host "4. Quitter"
        $Choix = Read-Host "Choisissez une option (1/2/3/4)"

        # Gerer les choix du menu
        switch ($Choix) {
            "1" {
                cls
                Write-Host "=== Ajouter une nouvelle tache planifiee ===" -ForegroundColor Green
                $NomTache = Read-Host "Entrez le nom de la tache"
                $Programme = Choisir-Programme
                $Horaire = Read-Host "Entrez l'horaire au format HH:MM AM/PM (ex : 09:00AM)"
                Ajouter-TachePlanifiee -NomTache $NomTache -Programme $Programme -Horaire $Horaire
            }
            "2" {
                cls
                Afficher-TachesPlanifiees
            }
            "3" {
                cls
                Write-Host "=== Supprimer une tache planifiee ===" -ForegroundColor Green
                Supprimer-TachePlanifiee
            }
            "4" {
                cls
                Write-Host "Au revoir !" -ForegroundColor Cyan
                exit
            }
            default {
                cls
                Write-Host "Option invalide. Reessayez." -ForegroundColor Red
            }
        }
    }
}

# Lancer le menu principal
Menu-Principal
