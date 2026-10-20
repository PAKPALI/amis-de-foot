<?php

namespace App\Http\Requests;

use App\Models\Article;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ArticleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canAccessAdministration() === true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:180'],
            'excerpt' => ['required', 'string', 'max:320'],
            'content' => ['required', 'string', 'max:50000'],
            'status' => ['required', Rule::in([Article::STATUS_DRAFT, Article::STATUS_PUBLISHED])],
            'photos' => ['nullable', 'array', 'max:3'],
            'photos.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'remove_cover' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Le titre de l’article est obligatoire.',
            'excerpt.required' => 'Le résumé de l’article est obligatoire.',
            'content.required' => 'Le contenu de l’article est obligatoire.',
            'photos.max' => 'Vous pouvez ajouter au maximum 3 photos.',
            'photos.*.image' => 'Chaque fichier doit être une image.',
            'photos.*.max' => 'Chaque image ne doit pas dépasser 4 Mo.',
        ];
    }
}
