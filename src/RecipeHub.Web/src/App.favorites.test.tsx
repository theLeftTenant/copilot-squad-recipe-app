import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { apiClient, type FavoriteRecipe, type Recipe } from './api';

const recipes: Recipe[] = [
  {
    id: 1,
    title: 'Smoky Chili',
    description: 'A fast weeknight chili.',
    difficulty: 'Easy',
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    servings: 4,
    imageUrl: null,
    tagNames: ['Comfort'],
  },
  {
    id: 2,
    title: 'Lemon Pasta',
    description: 'Bright and quick.',
    difficulty: 'Medium',
    prepTimeMinutes: 15,
    cookTimeMinutes: 12,
    servings: 2,
    imageUrl: null,
    tagNames: ['Dinner'],
  },
];

function toFavorite(recipe: Recipe): FavoriteRecipe {
  return {
    recipeId: recipe.id,
    title: recipe.title,
    description: recipe.description,
    difficulty: recipe.difficulty,
    prepTimeMinutes: recipe.prepTimeMinutes,
    cookTimeMinutes: recipe.cookTimeMinutes,
    servings: recipe.servings,
    imageUrl: recipe.imageUrl,
    tagNames: recipe.tagNames,
    favoritedAt: '2026-05-27T11:56:19.403-05:00',
  };
}

function renderApp(initialEntries = ['/recipes']) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('favorites flow', () => {
  it('shows an empty state when no recipes are favorited yet', async () => {
    vi.spyOn(apiClient, 'listRecipes').mockResolvedValue(recipes);
    vi.spyOn(apiClient, 'listTags').mockResolvedValue([]);
    vi.spyOn(apiClient, 'listFavorites').mockResolvedValue([]);
    vi.spyOn(apiClient, 'addFavorite').mockResolvedValue();
    vi.spyOn(apiClient, 'removeFavorite').mockResolvedValue();

    renderApp(['/favorites']);

    expect(
      await screen.findByText('You haven’t saved any favorites yet.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Browse recipes' }),
    ).toBeInTheDocument();
  });

  it('adds a recipe to favorites and shows it on the favorites page', async () => {
    let favoriteRecipes: FavoriteRecipe[] = [toFavorite(recipes[1])];

    vi.spyOn(apiClient, 'listRecipes').mockResolvedValue(recipes);
    vi.spyOn(apiClient, 'listTags').mockResolvedValue([]);
    vi.spyOn(apiClient, 'listFavorites').mockImplementation(
      async () => favoriteRecipes,
    );
    vi.spyOn(apiClient, 'addFavorite').mockImplementation(
      async (recipeId: number) => {
        const recipe = recipes.find((item) => item.id === recipeId);
        if (
          recipe &&
          !favoriteRecipes.some((item) => item.recipeId === recipe.id)
        ) {
          favoriteRecipes = [toFavorite(recipe), ...favoriteRecipes];
        }
      },
    );
    vi.spyOn(apiClient, 'removeFavorite').mockResolvedValue();

    renderApp();
    const user = userEvent.setup();

    await screen.findByText('Smoky Chili');
    await user.click(
      screen.getByRole('button', { name: 'Save Smoky Chili to favorites' }),
    );

    await waitFor(() => {
      expect(apiClient.addFavorite).toHaveBeenCalledWith(1);
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: 'Remove Smoky Chili from favorites',
        }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole('heading', { name: 'Recipes' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Favorites' }));

    expect(await screen.findByText('Smoky Chili')).toBeInTheDocument();
    expect(screen.getByText('Lemon Pasta')).toBeInTheDocument();
  });

  it('removes a recipe from favorites from the recipe cards and returns to empty state', async () => {
    let favoriteRecipes: FavoriteRecipe[] = [toFavorite(recipes[0])];

    vi.spyOn(apiClient, 'listRecipes').mockResolvedValue(recipes);
    vi.spyOn(apiClient, 'listTags').mockResolvedValue([]);
    vi.spyOn(apiClient, 'listFavorites').mockImplementation(
      async () => favoriteRecipes,
    );
    vi.spyOn(apiClient, 'addFavorite').mockResolvedValue();
    vi.spyOn(apiClient, 'removeFavorite').mockImplementation(
      async (recipeId: number) => {
        favoriteRecipes = favoriteRecipes.filter(
          (item) => item.recipeId !== recipeId,
        );
      },
    );

    renderApp();
    const user = userEvent.setup();

    await screen.findByText('Smoky Chili');
    await user.click(
      screen.getByRole('button', { name: 'Remove Smoky Chili from favorites' }),
    );

    await waitFor(() => {
      expect(apiClient.removeFavorite).toHaveBeenCalledWith(1);
    });

    await user.click(screen.getByRole('link', { name: 'Favorites' }));

    expect(
      await screen.findByText('You haven’t saved any favorites yet.'),
    ).toBeInTheDocument();
  });

  it('shows a clear error when favorites fail to load', async () => {
    vi.spyOn(apiClient, 'listRecipes').mockResolvedValue(recipes);
    vi.spyOn(apiClient, 'listTags').mockResolvedValue([]);
    vi.spyOn(apiClient, 'listFavorites').mockRejectedValue(
      new Error('Favorites service is down'),
    );
    vi.spyOn(apiClient, 'addFavorite').mockResolvedValue();
    vi.spyOn(apiClient, 'removeFavorite').mockResolvedValue();

    renderApp(['/favorites']);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't load your favorites. Favorites service is down",
    );
  });
});
