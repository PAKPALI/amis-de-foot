<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Inertia\Inertia;
use Inertia\Response;

class PublicSiteController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('welcome', ['latestArticles' => $this->published()->limit(3)->get()->map(fn (Article $article) => $this->articleData($article))]);
    }

    public function club(): Response
    {
        return Inertia::render('public/club');
    }

    public function contact(): Response
    {
        return Inertia::render('public/contact');
    }

    public function articles(): Response
    {
        return Inertia::render('public/articles', [
            'articles' => $this->published()->get()->map(fn (Article $article) => $this->articleData($article)),
        ]);
    }

    public function article(Article $article): Response
    {
        abort_unless($article->status === Article::STATUS_PUBLISHED && $article->published_at?->isPast(), 404);
        $article->load('author:id,name');

        return Inertia::render('public/article', ['article' => [
            ...$this->articleData($article),
            'content' => $article->content,
            'author' => $article->author?->name ?? 'Amis de foot',
        ]]);
    }

    private function published()
    {
        return Article::query()->published()->with('author:id,name')->orderByDesc('published_at');
    }

    private function articleData(Article $article): array
    {
        return [
            'id' => $article->id,
            'title' => $article->title,
            'slug' => $article->slug,
            'excerpt' => $article->excerpt,
            'coverImage' => $article->cover_image ? asset('storage/'.$article->cover_image) : null,
            'images' => collect($article->gallery_images ?: array_filter([$article->cover_image]))->map(fn (string $path) => asset('storage/'.$path))->values(),
            'publishedAt' => $article->published_at?->toISOString(),
        ];
    }
}
