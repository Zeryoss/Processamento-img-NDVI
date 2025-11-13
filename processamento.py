import rasterio
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
import io
import base64

def analisar_ndvi(caminho_tiff):

    try:
        # --- Lê o arquivo NDVI ---
        with rasterio.open(caminho_tiff) as src:
            ndvi = src.read(1).astype(float)
            nodata = src.nodata

        # --- Trata valores nulos ---
        if nodata is not None:
            ndvi[ndvi == nodata] = np.nan

        mask_valid = ~np.isnan(ndvi)
        total_pixels = np.count_nonzero(mask_valid)
        if total_pixels == 0:
            return {'erro': 'Imagem sem dados válidos para análise.'}

        Agua = (((ndvi >= 0.7) & (ndvi <= 1.0)) | ((ndvi >= 0.05) & (ndvi < 0.06))).sum()
        Solo_Exposto = ((ndvi >= 0.5) & (ndvi < 0.7)).sum()
        Vegetação_Moderada = ((ndvi >= 0.2) & (ndvi < 0.5)).sum()
        Vegetação_Densa = (((ndvi >= 0.0) & (ndvi < 0.05)) | ((ndvi >= 0.06) & (ndvi < 0.2))).sum()
        

        # --- Classificação pelos limites ---
        classes = np.zeros_like(ndvi)
        classes[((ndvi >= 0.7) & (ndvi <= 1.0)) | ((ndvi >= 0.05) & (ndvi < 0.06))] = 0  # Água
        classes[(ndvi >= 0.5) & (ndvi < 0.7)] = 1 # Solo exposto
        classes[(ndvi >= 0.2) & (ndvi < 0.5)] = 2 # Vegetação moderada
        classes[((ndvi >= 0.0) & (ndvi < 0.05)) | ((ndvi >= 0.06) & (ndvi < 0.2))] = 3 # Vegetação densa

        # --- Mapa de cores ---
        colors = ['#0047AB',  # Água 
                '#DAA520',  # Solo exposto 
                '#228B22',  # Vegetação moderada
                '#006400']  # Vegetação densa

        cmap = mcolors.ListedColormap(colors)
        bounds = [0, 1, 2, 3, 4]
        norm = mcolors.BoundaryNorm(bounds, cmap.N)

        # --- Plotagem ---
        fig, ax = plt.subplots(figsize=(10, 8))
        img = ax.imshow(classes, cmap=cmap, norm=norm)
        plt.colorbar(
            img,
            ax=ax,
            ticks=[0.5, 1.5, 2.5, 3.5],
            label='Classes NDVI',
            format=plt.FuncFormatter(lambda x, _: ['Água', 'Solo Exposto', 'Veg. Moderada', 'Veg. Densa'][int(x)])
        )
        plt.title('Classificação NDVI')
        plt.axis('off')
        

        # Salva o gráfico em memória
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        plt.close(fig)
        buf.seek(0)
        imagem_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')

        # --- Cálculo percentual ---
        pct_agua = (Agua / total_pixels) * 100
        pct_desmatado = (Solo_Exposto / total_pixels) * 100
        pct_Vegetação_Moderada = (Vegetação_Moderada / total_pixels) * 100
        pct_Vegetação_Densa = (Vegetação_Densa / total_pixels) * 100

        # --- Retorno para o Flask ---
        return {
                'agua': round(pct_agua, 2),
                'desmatado': round(pct_desmatado, 2),
                'vegetacaoM': round(pct_Vegetação_Moderada, 2),
                'vegetacaoD': round(pct_Vegetação_Densa, 2),
                'imagem': imagem_base64
        }

    except Exception as e:
        return {'erro': f'Falha ao processar imagem: {str(e)}'}
