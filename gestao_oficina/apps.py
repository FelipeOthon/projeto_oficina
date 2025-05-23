# gestao_oficina/apps.py
from django.apps import AppConfig

class GestaoOficinaConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'gestao_oficina'

    def ready(self):
        import gestao_oficina.signals  #Importa seus sinais para que sejam registrados