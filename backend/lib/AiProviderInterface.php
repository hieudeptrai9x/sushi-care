<?php

declare(strict_types=1);

namespace SushiCare\Lib;

interface AiProviderInterface
{
    public function chat(array $messages, array $settings): string;
}
