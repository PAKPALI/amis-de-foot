<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class Article extends Model
{
    use HasFactory;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_PUBLISHED = 'published';

    protected $fillable = ['author_id', 'title', 'slug', 'excerpt', 'content', 'cover_image', 'gallery_images', 'status', 'published_at'];

    protected function casts(): array
    {
        return ['published_at' => 'datetime', 'gallery_images' => 'array'];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_PUBLISHED)->whereNotNull('published_at')->where('published_at', '<=', now());
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
