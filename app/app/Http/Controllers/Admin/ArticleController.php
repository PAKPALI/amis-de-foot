<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ArticleRequest;
use App\Models\Article;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/articles', [
            'articles' => Article::query()->with('author:id,name')->orderByDesc('updated_at')->get()->map(fn (Article $article) => [
                'id' => $article->id, 'title' => $article->title, 'slug' => $article->slug,
                'excerpt' => $article->excerpt, 'content' => $article->content, 'status' => $article->status,
                'coverImage' => $article->cover_image ? asset('storage/'.$article->cover_image) : null,
                'images' => collect($article->gallery_images ?: array_filter([$article->cover_image]))->map(fn (string $path) => asset('storage/'.$path))->values(),
                'author' => $article->author?->name ?? 'Compte supprimé',
                'publishedAt' => $article->published_at?->toISOString(), 'updatedAt' => $article->updated_at->toISOString(),
            ]),
        ]);
    }

    public function store(ArticleRequest $request): RedirectResponse
    {
        $values = $request->validated();
        $images = collect($request->file('photos', []))->map(fn ($photo) => $photo->store('articles', 'public'))->values()->all();
        $cover = $images[0] ?? null;
        Article::query()->create([
            'author_id' => $request->user()->id, 'title' => $values['title'],
            'slug' => $this->uniqueSlug($values['title']), 'excerpt' => $values['excerpt'],
            'content' => $values['content'], 'cover_image' => $cover, 'gallery_images' => $images ?: null, 'status' => $values['status'],
            'published_at' => $values['status'] === Article::STATUS_PUBLISHED ? now() : null,
        ]);

        return to_route('admin.articles')->with('status', $values['status'] === Article::STATUS_PUBLISHED ? 'Article publié.' : 'Brouillon enregistré.');
    }

    public function update(ArticleRequest $request, Article $article): RedirectResponse
    {
        $values = $request->validated();
        $images = $article->gallery_images ?: array_filter([$article->cover_image]);
        if ($request->boolean('remove_cover') || $request->hasFile('photos')) {
            Storage::disk('public')->delete($images);
            $images = [];
        }
        if ($request->hasFile('photos')) {
            $images = collect($request->file('photos', []))->map(fn ($photo) => $photo->store('articles', 'public'))->values()->all();
        }
        $article->update([
            'title' => $values['title'], 'excerpt' => $values['excerpt'], 'content' => $values['content'],
            'cover_image' => $images[0] ?? null, 'gallery_images' => $images ?: null, 'status' => $values['status'],
            'published_at' => $values['status'] === Article::STATUS_PUBLISHED ? ($article->published_at ?? now()) : null,
        ]);

        return to_route('admin.articles')->with('status', $values['status'] === Article::STATUS_PUBLISHED ? 'Article mis à jour et publié.' : 'Brouillon mis à jour.');
    }

    public function destroy(Article $article): RedirectResponse
    {
        Storage::disk('public')->delete($article->gallery_images ?: array_filter([$article->cover_image]));
        $article->delete();

        return to_route('admin.articles')->with('status', 'Article supprimé.');
    }

    private function uniqueSlug(string $title): string
    {
        $base = Str::slug($title) ?: 'actualite';
        $slug = $base;
        for ($suffix = 2; Article::query()->where('slug', $slug)->exists(); $suffix++) $slug = $base.'-'.$suffix;
        return $slug;
    }
}
