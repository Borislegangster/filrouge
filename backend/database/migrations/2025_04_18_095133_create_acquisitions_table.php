<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('acquisitions', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('provider_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('amount', 10, 2)->nullable();
            $table->string('status'); // En attente, Validée, Rejetée, Livrée
            $table->date('request_date');
            $table->date('approval_date')->nullable();
            $table->date('delivery_date')->nullable();
            $table->foreignId('requested_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });

        // Table pivot entre acquisitions et équipements
        Schema::create('acquisition_equipment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('acquisition_id')->constrained()->onDelete('cascade');
            $table->foreignId('equipment_id')->constrained()->onDelete('cascade');
            $table->integer('quantity')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('acquisition_equipment');
        Schema::dropIfExists('acquisitions');
    }
};
