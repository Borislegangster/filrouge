<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Invitation à la Plateforme</title>
    <style type="text/css">
        /* Styles inline pour la compatibilité email */
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .button {
            display: inline-block;
            background-color: #4CAF50;
            color: white !important;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin: 15px 0;
        }

        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #777;
        }

    </style>
</head>
<body>
    <div class="container">
        <h1 style="color: #2c3e50;">Bienvenue sur notre Plateforme de Gestion du Matériel</h1>

        <p>Bonjour,</p>

        <p>Vous avez été invité à rejoindre la plateforme en tant que <strong style="color: #e74c3c;">{{ $role }}</strong>.</p>

        <p>Voici votre code de vérification : <strong style="font-size: 18px;">{{ $code }}</strong></p>
        <p><em>Ce code expirera dans 48 heures.</em></p>

        <a href="{{ env('FRONTEND_URL') }}/verify-invitation?token={{ $token }}" class="button">
            Valider mon invitation
        </a>

        <p>Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br />
            <small>{{ env('FRONTEND_URL') }}/verify-code?token={{ $token }}</small></p>

        <div class="footer">
            <p>Si vous n'avez pas demandé cette invitation, ignorez cet email.</p>
            <p>© {{ date('Y') }} Plateforme de Gestion du Matériel. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
