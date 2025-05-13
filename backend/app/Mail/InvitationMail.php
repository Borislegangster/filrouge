<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $token;
    public $verificationCode;
    public $role;

    /**
     * Crée une nouvelle instance du message.
     */
    public function __construct($token, $verificationCode, $role)
    {
        $this->token = $token;
        $this->verificationCode = $verificationCode;
        $this->role = $role;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Invitation à la Plateforme de Gestion du Matériel',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.invitation', // Chemin vers la vue email
            with: [
                'token' => $this->token,
                'code' => $this->verificationCode,
                'role' => $this->role,
            ],
        );
    }

    /**
     * Get the attachments.
     */
    public function attachments(): array
    {
        return [];
    }
}