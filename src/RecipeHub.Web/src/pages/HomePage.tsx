import { Link, useNavigate } from 'react-router-dom';
import { RecipeCard } from '../components/recipe';
import { Button, Spinner } from '../components/ui';
import { useFavorites, useRecipes } from '../hooks';
import styles from './HomePage.module.css';

export function HomePage() {
  const navigate = useNavigate();
  const { data, isLoading } = useRecipes();
  const favorites = useFavorites();

  const featured = (data ?? []).slice(0, 3);
  const favoriteIds = new Set(
    (favorites.data ?? []).map((favorite) => favorite.recipeId)
  );
  const favoritesDisabled = favorites.isLoading || favorites.isError;
  const favoritesUnavailable = favorites.isError;

  return (
    <div>
      <section className={styles.hero}>
        <h1>RecipeHub</h1>
        <p className={styles.tagline}>
          Discover, create, and cook your favorite recipes.
        </p>
        <div className={styles.cta}>
          <Link to="/recipes">
            <Button variant="primary" size="lg">
              Browse Recipes
            </Button>
          </Link>
          <Link to="/recipes/new">
            <Button variant="ghost" size="lg">
              Add Recipe
            </Button>
          </Link>
        </div>
      </section>

      <section className={styles.featured}>
        <h2>Featured</h2>
        {favoritesUnavailable ? (
          <p className={styles.notice}>Favorites are unavailable right now.</p>
        ) : null}
        {isLoading ? (
          <Spinner label="Loading featured recipes…" />
        ) : featured.length === 0 ? (
          <p>No recipes yet. Be the first to add one!</p>
        ) : (
          <div className={styles.strip}>
            {featured.map((r) => (
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
      </section>
    </div>
  );
}

export default HomePage;
