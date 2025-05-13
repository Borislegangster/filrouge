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
        Schema::table('acquisitions', function (Blueprint $table) {
            $table->enum('urgency', ['Haute', 'Normale', 'Basse'])->default('Normale');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('acquisitions', function (Blueprint $table) {
            $table->dropColumn('urgency');
        });
    }
};
