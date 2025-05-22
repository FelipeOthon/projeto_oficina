from django.contrib import admin
from .models import Usuario, Cliente, Veiculo, OrdemDeServico, ItemOsPeca, ItemOsServico, Agendamento # Importe todos os seus models

# Registrando o modelo Usuario (se estiver usando o customizado)
# O admin do Django já lida bem com o User model, mas podemos customizar se necessário.
# Para o AbstractUser customizado, você pode querer usar UserAdmin para mais controle.
from django.contrib.auth.admin import UserAdmin

class CustomUserAdmin(UserAdmin):
    # Adicione 'tipo_usuario' aos list_display, fieldsets, etc., se quiser vê-lo e editá-lo no admin
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'tipo_usuario')
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('tipo_usuario',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('tipo_usuario',)}),
    )

admin.site.register(Usuario, CustomUserAdmin)

# Registrando os outros models de forma simples
admin.site.register(Cliente)
admin.site.register(Veiculo)
admin.site.register(OrdemDeServico)
admin.site.register(ItemOsPeca)
admin.site.register(ItemOsServico)
admin.site.register(Agendamento)

# Você pode criar classes Admin customizadas para cada model para controlar como eles aparecem
# Por exemplo, para Cliente:
# class ClienteAdmin(admin.ModelAdmin):
#     list_display = ('nome_completo', 'telefone_principal', 'email', 'data_cadastro')
#     search_fields = ('nome_completo', 'email', 'cpf_cnpj')
# admin.site.register(Cliente, ClienteAdmin)
# Faremos isso depois se você quiser refinar a aparência no admin.