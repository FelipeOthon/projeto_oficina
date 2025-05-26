# gestao_oficina/permissions.py
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminUser(BasePermission):
    """
    Permite acesso apenas a usuários administradores.
    """

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.tipo_usuario == 'admin'
        )


class IsMecanicoUser(BasePermission):  # Vamos manter, pode ser útil
    """
    Permite acesso apenas a usuários mecânicos.
    """

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.tipo_usuario == 'mecanico'
        )


class IsAdminOrMecanico(BasePermission):
    """
    Permite acesso a usuários administradores ou mecânicos.
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.tipo_usuario in ['admin', 'mecanico']


class AdminFullAccessMecanicoReadOnly(BasePermission):  # Nome mais descritivo
    """
    Admin tem acesso total. Mecanico tem acesso somente leitura (GET, HEAD, OPTIONS).
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False

        if request.user.tipo_usuario == 'admin':
            return True

        if request.user.tipo_usuario == 'mecanico' and request.method in SAFE_METHODS:
            return True

        return False


# A IsOwnerOrAdmin pode ficar como está, mas não a usaremos por enquanto para simplificar.
class IsOwnerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if request.user.tipo_usuario == 'admin':
            return True
        return False