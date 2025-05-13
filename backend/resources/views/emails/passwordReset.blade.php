@component('mail::message')
# Réinitialisation de votre mot de passe

Vous avez demandé à réinitialiser votre mot de passe. Voici votre code de vérification :

**Code :** {{ $code }}

Ce code est valable pendant 15 minutes.

{{-- @component('mail::button', ['url' => url('/verifyCode?token='.$token.'&email='.$email)])
Vérifier le code
@endcomponent --}}

Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.

Merci,<br>
{{ config('app.name') }}
@endcomponent