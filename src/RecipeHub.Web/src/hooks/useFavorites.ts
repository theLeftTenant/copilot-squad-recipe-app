import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';
import type { FavoriteRecipe, Recipe } from '../api';
import { favoriteKeys } from './queryKeys';

export function favoriteRecipeToRecipe(favorite: FavoriteRecipe): Recipe {
  return {
    id: favorite.recipeId,
    title: favorite.title,
    description: favorite.description,
    difficulty: favorite.difficulty,
    prepTimeMinutes: favorite.prepTimeMinutes,
    cookTimeMinutes: favorite.cookTimeMinutes,
    servings: favorite.servings,
    imageUrl: favorite.imageUrl,
    tagNames: favorite.tagNames,
  };
}

export function useFavorites() {
  return useQuery<FavoriteRecipe[]>({
    queryKey: favoriteKeys.all,
    queryFn: () => apiClient.listFavorites(),
  });
}

type ToggleFavoriteArgs = {
  recipe: Recipe;
  isFavorite: boolean;
};

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    ToggleFavoriteArgs,
    { previous: FavoriteRecipe[] | undefined }
  >({
    mutationFn: ({ recipe, isFavorite }) =>
      isFavorite ? apiClient.removeFavorite(recipe.id) : apiClient.addFavorite(recipe.id),
    onMutate: async ({ recipe, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: favoriteKeys.all });
      const previous = queryClient.getQueryData<FavoriteRecipe[]>(favoriteKeys.all);

      queryClient.setQueryData<FavoriteRecipe[]>(favoriteKeys.all, (current = []) => {
        if (isFavorite) {
          return current.filter((item) => item.recipeId !== recipe.id);
        }

        if (current.some((item) => item.recipeId === recipe.id)) {
          return current;
        }

        return [
          {
            recipeId: recipe.id,
            title: recipe.title,
            description: recipe.description,
            difficulty: recipe.difficulty,
            prepTimeMinutes: recipe.prepTimeMinutes,
            cookTimeMinutes: recipe.cookTimeMinutes,
            servings: recipe.servings,
            imageUrl: recipe.imageUrl,
            tagNames: recipe.tagNames,
            favoritedAt: new Date().toISOString(),
          },
          ...current,
        ];
      });

      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(favoriteKeys.all, context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
    },
  });
}
