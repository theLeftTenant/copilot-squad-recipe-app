using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using RecipeHub.Api.Dtos;
using RecipeHub.Api.Models;
using Xunit;

namespace RecipeHub.Api.Tests.Favorites;

public class FavoriteEndpointsTests
{
    private const string ImplicitUserId = "default";

    [Fact]
    public async Task GetFavorites_InitiallyReturnsEmptyArray()
    {
        using var factory = new RecipeApiFactory();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/favorites");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var favorites = await response.Content.ReadFromJsonAsync<FavoriteDto[]>();
        Assert.NotNull(favorites);
        Assert.Empty(favorites!);
    }

    [Fact]
    public async Task FavoriteCrud_RoundTripsThroughAddListAndDelete()
    {
        using var factory = new RecipeApiFactory();
        var client = factory.CreateClient();

        var createResponse = await client.PostAsJsonAsync("/api/favorites", new AddFavoriteRequest(1));

        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        var listResponse = await client.GetAsync("/api/favorites");

        Assert.Equal(HttpStatusCode.OK, listResponse.StatusCode);
        var favorites = await listResponse.Content.ReadFromJsonAsync<FavoriteDto[]>();
        Assert.NotNull(favorites);
        var favorite = Assert.Single(favorites!);
        Assert.Equal(1, favorite.RecipeId);
        Assert.Equal("Classic Margherita Pizza", favorite.Title);

        var deleteResponse = await client.DeleteAsync("/api/favorites/1");

        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var afterDeleteResponse = await client.GetAsync("/api/favorites");

        Assert.Equal(HttpStatusCode.OK, afterDeleteResponse.StatusCode);
        var afterDelete = await afterDeleteResponse.Content.ReadFromJsonAsync<FavoriteDto[]>();
        Assert.NotNull(afterDelete);
        Assert.Empty(afterDelete!);
    }

    [Fact]
    public async Task PostFavorite_CreatesFavoriteAndPersistsIt()
    {
        using var factory = new RecipeApiFactory();
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/favorites", new AddFavoriteRequest(1));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var favorite = await response.Content.ReadFromJsonAsync<FavoriteDto>();
        Assert.NotNull(favorite);
        Assert.Equal(1, favorite!.RecipeId);
        Assert.Equal("Classic Margherita Pizza", favorite.Title);

        await using var db = factory.CreateDbContext();
        var saved = await db.Favorites
            .AsNoTracking()
            .SingleOrDefaultAsync(f => f.UserId == ImplicitUserId && f.RecipeId == 1);

        Assert.NotNull(saved);
        Assert.True(saved!.CreatedAt <= DateTime.UtcNow);
    }

    [Fact]
    public async Task PostFavorite_WhenRecipeMissing_Returns404()
    {
        using var factory = new RecipeApiFactory();
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/favorites", new AddFavoriteRequest(9999));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task PostFavorite_WhenAlreadyFavorited_ReturnsExistingFavoriteWithoutDuplicateRow()
    {
        using var factory = new RecipeApiFactory();
        var client = factory.CreateClient();

        var firstResponse = await client.PostAsJsonAsync("/api/favorites", new AddFavoriteRequest(1));
        firstResponse.EnsureSuccessStatusCode();
        var firstFavorite = await firstResponse.Content.ReadFromJsonAsync<FavoriteDto>();

        var secondResponse = await client.PostAsJsonAsync("/api/favorites", new AddFavoriteRequest(1));

        Assert.Equal(HttpStatusCode.OK, secondResponse.StatusCode);
        var secondFavorite = await secondResponse.Content.ReadFromJsonAsync<FavoriteDto>();
        Assert.NotNull(firstFavorite);
        Assert.NotNull(secondFavorite);
        Assert.Equal(firstFavorite!.RecipeId, secondFavorite!.RecipeId);
        Assert.Equal(firstFavorite.FavoritedAt, secondFavorite.FavoritedAt);

        await using var db = factory.CreateDbContext();
        var count = await db.Favorites
            .CountAsync(f => f.UserId == ImplicitUserId && f.RecipeId == 1);

        Assert.Equal(1, count);
    }

    [Fact]
    public async Task GetFavorites_ReturnsNewestFavoritesFirst()
    {
        using var factory = new RecipeApiFactory();
        await using var db = factory.CreateDbContext();
        db.Favorites.AddRange(
            new Favorite
            {
                UserId = ImplicitUserId,
                RecipeId = 1,
                CreatedAt = DateTime.UtcNow.AddMinutes(-10)
            },
            new Favorite
            {
                UserId = ImplicitUserId,
                RecipeId = 2,
                CreatedAt = DateTime.UtcNow.AddMinutes(-1)
            });
        await db.SaveChangesAsync();

        var client = factory.CreateClient();
        var response = await client.GetAsync("/api/favorites");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var favorites = await response.Content.ReadFromJsonAsync<FavoriteDto[]>();
        Assert.NotNull(favorites);
        Assert.Equal(new[] { 2, 1 }, favorites!.Select(f => f.RecipeId).ToArray());
    }

    [Fact]
    public async Task DeleteFavorite_RemovesPersistedFavorite()
    {
        using var factory = new RecipeApiFactory();
        await using var db = factory.CreateDbContext();
        db.Favorites.Add(new Favorite
        {
            UserId = ImplicitUserId,
            RecipeId = 1,
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        var client = factory.CreateClient();
        var response = await client.DeleteAsync("/api/favorites/1");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        await using var verificationDb = factory.CreateDbContext();
        var saved = await verificationDb.Favorites
            .AsNoTracking()
            .SingleOrDefaultAsync(f => f.UserId == ImplicitUserId && f.RecipeId == 1);

        Assert.Null(saved);
    }

    [Fact]
    public async Task DeleteFavorite_WhenMissing_Returns404()
    {
        using var factory = new RecipeApiFactory();
        var client = factory.CreateClient();

        var response = await client.DeleteAsync("/api/favorites/1");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
