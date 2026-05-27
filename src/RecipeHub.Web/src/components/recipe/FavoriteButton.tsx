import type { KeyboardEvent, MouseEvent } from 'react';
import type { Recipe } from '../../api';
import { useToggleFavorite } from '../../hooks';
import { Button } from '../ui';
import styles from './FavoriteButton.module.css';

export interface FavoriteButtonProps {
  recipe: Recipe;
  isFavorite: boolean;
  disabled?: boolean;
}

export function FavoriteButton({
  recipe,
  isFavorite,
  disabled = false,
}: FavoriteButtonProps) {
  const mutation = useToggleFavorite();
  const pending = mutation.isPending;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (disabled || pending) {
      return;
    }

    mutation.mutate({ recipe, isFavorite });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return (
    <span className={styles.wrapper}>
      <Button
        variant='ghost'
        size='sm'
        className={`${styles.button} ${isFavorite ? styles.active : ''}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        loading={pending}
        aria-pressed={isFavorite}
        aria-label={
          isFavorite
            ? `Remove ${recipe.title} from favorites`
            : `Save ${recipe.title} to favorites`
        }
      >
        <span aria-hidden='true'>{isFavorite ? '♥' : '♡'}</span>
        {isFavorite ? 'Saved' : 'Save'}
      </Button>
      {mutation.isError ? (
        <span className={styles.error} role='alert'>
          Couldn't update favorite.
        </span>
      ) : null}
    </span>
  );
}

export default FavoriteButton;
