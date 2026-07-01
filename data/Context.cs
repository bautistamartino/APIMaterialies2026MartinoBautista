using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using APIMateriales2026MartinoBautista.models;
using Microsoft.EntityFrameworkCore;

public class Context : IdentityDbContext<ApplicationUser>

{

    public Context(DbContextOptions<Context> options)

        : base(options)

    {

    }

 

    // Agrega tus DbSet aquí
    public DbSet<Materiales> Materiales { get; set; }
    public DbSet<Productos> Productos { get; set; }
    public DbSet<Rubro> Rubros { get; set; }

}

