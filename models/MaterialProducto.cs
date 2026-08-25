using System.ComponentModel.DataAnnotations;
namespace APIMateriales2026MartinoBautista.models
{
        public class MaterialProductos
    {
        [Key]
        public int MaterialProductoId { get; set; }
        public int MaterialId { get; set; }
        public int ProductoId { get; set; }
        public decimal Cantidad { get; set; }
        public decimal PrecioCostoUnitario { get; set; }
        public decimal Subtotal { get; set; }

    }
    
}