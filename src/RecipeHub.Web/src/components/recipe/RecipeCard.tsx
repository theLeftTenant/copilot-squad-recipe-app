import type { Recipe } from '../../api';
import { Badge, Card } from '../ui';
import { FavoriteButton } from './FavoriteButton';
import styles from './RecipeCard.module.css';

export interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onClick?: () => void;
  favoritesDisabled?: boolean;
  favoritesNotice?: string;
}

export function RecipeCard({
  recipe,
  isFavorite,
  onClick,
  favoritesDisabled = false,
  favoritesNotice,
}: RecipeCardProps) {
  return (
    <Card
      title={
        <div className={styles.header}>
          <span className={styles.title}>{recipe.title}</span>
          <FavoriteButton
            recipe={recipe}
            isFavorite={isFavorite}
            disabled={favoritesDisabled}
          />
        </div>
      }
      onClick={onClick}
    >
      <p className={styles.description}>{recipe.description ?? 'No description.'}</p>
      <div className={styles.tags}>
        {recipe.tagNames.map((tag) => (
          <Badge key={tag} variant="info">
            {tag}
          </Badge>
        ))}
      </div>
      <div className={styles.meta}>
        <span>{recipe.difficulty}</span>
        <span>
          Prep {recipe.prepTimeMinutes}m · Cook {recipe.cookTimeMinutes}m
        </span>
      </div>
      {favoritesNotice ? (
        <p className={styles.notice}>{favoritesNotice}</p>
      ) : null}
    </Card>
  );
}

export default RecipeCard;
