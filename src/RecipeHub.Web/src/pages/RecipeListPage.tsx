import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecipeCard } from '../components/recipe';
import { Spinner } from '../components/ui';
import { FilterPanel, SearchBar } from '../components/search';
import { useFavorites, useRecipes, useSearch } from '../hooks';
import type { Recipe } from '../api';
import styles from './RecipeListPage.module.css';

export function RecipeListPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string | undefined>(undefined);

  const hasFilters = query.trim().length > 0 || tag !== undefined;
  const allRecipes = useRecipes();
  const searchResults = useSearch({ q: query, tag });
  const favorites = useFavorites();

  const active = hasFilters ? searchResults : allRecipes;
  const recipes: Recipe[] = active.data ?? [];
  const favoriteIds = new Set(
    (favorites.data ?? []).map((favorite) => favorite.recipeId)
  );
  const favoritesDisabled = favorites.isLoading || favorites.isError;
  const favoritesUnavailable = favorites.isError;

  return (
    <div>
      <div className={styles.header}>
        <h1>Recipes</h1>
        <SearchBar value={query} onChange={setQuery} />
      </div>
      <FilterPanel selectedTag={tag} onTagChange={setTag} />
      {favoritesUnavailable ? (
        <div className={styles.notice} role="alert">
          Favorites are temporarily unavailable. You can still browse recipes.
        </div>
      ) : null}

      {active.isLoading ? (
        <Spinner label="Loading recipes…" />
      ) : active.isError ? (
        <div className={styles.error}>
          Couldn't load recipes.{' '}
          {active.error instanceof Error ? active.error.message : ''}
        </div>
      ) : recipes.length === 0 ? (
        <div className={styles.empty}>
          {hasFilters ? 'No recipes match your filters.' : 'No recipes yet.'}
        </div>
      ) : (
        <div className={styles.grid}>
          {recipes.map((r) => (
            <RecipeCard
              key={r.id}
              recipe={r}
              isFavorite={favoriteIds.has(r.id)}
              favoritesDisabled={favoritesDisabled}
              favoritesNotice={
                favoritesUnavailable ? 'Favorites are unavailable right now.' : undefined
              }
              onClick={() => navigate(`/recipes/${r.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default RecipeListPage;
