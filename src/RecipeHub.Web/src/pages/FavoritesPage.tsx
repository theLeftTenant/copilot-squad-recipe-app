import { Link, useNavigate } from 'react-router-dom';
import { RecipeCard } from '../components/recipe';
import { Button, Spinner } from '../components/ui';
import { favoriteRecipeToRecipe, useFavorites } from '../hooks';
import styles from './FavoritesPage.module.css';

export function FavoritesPage() {
  const navigate = useNavigate();
  const favorites = useFavorites();
  const recipes = (favorites.data ?? []).map(favoriteRecipeToRecipe);

  if (favorites.isLoading) {
    return (
      <div className={styles.wrapper}>
        <h1>Favorites</h1>
        <Spinner label="Loading your favorites…" />
      </div>
    );
  }

  if (favorites.isError) {
    return (
      <div className={styles.wrapper}>
        <h1>Favorites</h1>
        <p className={styles.error} role="alert">
          Couldn't load your favorites.{' '}
          {favorites.error instanceof Error ? favorites.error.message : ''}
        </p>
        <Link to="/recipes">
          <Button variant="secondary">Back to recipes</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <h1>Favorites</h1>
      <p className={styles.note}>Recipes you’ve saved for a quick return trip.</p>
      {recipes.length === 0 ? (
        <div className={styles.empty}>
          <p>You haven’t saved any favorites yet.</p>
          <Link to="/recipes">
            <Button variant="secondary">Browse recipes</Button>
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isFavorite
              onClick={() => navigate(`/recipes/${recipe.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoritesPage;
