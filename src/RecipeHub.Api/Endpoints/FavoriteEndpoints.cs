using Microsoft.EntityFrameworkCore;
using RecipeHub.Api.Data;
using RecipeHub.Api.Dtos;
using RecipeHub.Api.Models;

namespace RecipeHub.Api.Endpoints;

public static class FavoriteEndpoints
{
    internal const string ImplicitUserId = "default";

    public static void MapFavoriteEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/favorites").WithTags("Favorites");

        group.MapGet("/", GetAllAsync);
        group.MapPost("/", AddAsync);
        group.MapDelete("/{recipeId:int}", RemoveAsync);
    }

    private static async Task<IResult> GetAllAsync(RecipeDbContext db, CancellationToken ct)
    {
        var favorites = await db.Favorites
            .AsNoTracking()
            .Where(f => f.UserId == ImplicitUserId)
            .Include(f => f.Recipe!)
                .ThenInclude(r => r.RecipeTags)
                    .ThenInclude(rt => rt.Tag)
            .OrderByDescending(f => f.CreatedAt)
            .ThenBy(f => f.RecipeId)
            .ToListAsync(ct);

        return Results.Ok(favorites
            .Where(f => f.Recipe is not null)
            .Select(ToDto)
            .ToArray());
    }

    private static async Task<IResult> AddAsync(
        AddFavoriteRequest request,
        RecipeDbContext db,
        CancellationToken ct)
    {
        var existing = await db.Favorites
            .AsNoTracking()
            .Where(f => f.UserId == ImplicitUserId && f.RecipeId == request.RecipeId)
            .Include(f => f.Recipe!)
                .ThenInclude(r => r.RecipeTags)
                    .ThenInclude(rt => rt.Tag)
            .FirstOrDefaultAsync(ct);

        if (existing is not null && existing.Recipe is not null)
        {
            return Results.Ok(ToDto(existing));
        }

        var recipe = await db.Recipes
            .AsNoTracking()
            .Include(r => r.RecipeTags)
                .ThenInclude(rt => rt.Tag)
            .FirstOrDefaultAsync(r => r.Id == request.RecipeId, ct);

        if (recipe is null)
        {
            return Results.NotFound();
        }

        var favorite = new Favorite
        {
            UserId = ImplicitUserId,
            RecipeId = recipe.Id,
            CreatedAt = DateTime.UtcNow
        };

        db.Favorites.Add(favorite);
        await db.SaveChangesAsync(ct);

        return Results.Created($"/api/favorites/{recipe.Id}", ToDto(recipe, favorite.CreatedAt));
    }

    private static async Task<IResult> RemoveAsync(
        int recipeId,
        RecipeDbContext db,
        CancellationToken ct)
    {
        var favorite = await db.Favorites
            .FirstOrDefaultAsync(f => f.UserId == ImplicitUserId && f.RecipeId == recipeId, ct);

        if (favorite is null)
        {
            return Results.NotFound();
        }

        db.Favorites.Remove(favorite);
        await db.SaveChangesAsync(ct);
        return Results.NoContent();
    }

    private static FavoriteDto ToDto(Favorite favorite)
        => ToDto(favorite.Recipe!, favorite.CreatedAt);

    private static FavoriteDto ToDto(Recipe recipe, DateTime favoritedAt) => new(
        recipe.Id,
        recipe.Title,
        recipe.Description,
        recipe.Difficulty.ToString(),
        recipe.PrepTimeMinutes,
        recipe.CookTimeMinutes,
        recipe.Servings,
        recipe.ImageUrl,
        recipe.RecipeTags
            .Where(rt => rt.Tag is not null)
            .Select(rt => rt.Tag!.Name)
            .OrderBy(n => n)
            .ToArray(),
        favoritedAt
    );
}
