using System.ComponentModel.DataAnnotations;
namespace APIMateriales2026MartinoBautista.models
{
        public class Rubro
    {
        [Key]
         public int RubroId { get; set; } 

        public string? Descripcion { get; set; } = null!;
        public bool Eliminado { get; set; }
    }
}