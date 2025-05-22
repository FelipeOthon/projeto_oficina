#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'projeto_oficina.settings')

    # --- Início do Bloco de Depuração para ROOT_URLCONF ---
    try:
        from django.conf import settings
        import importlib
        if settings.ROOT_URLCONF:
            urlconf_module = importlib.import_module(settings.ROOT_URLCONF)
            print(f"DEBUG: Django está usando ROOT_URLCONF '{settings.ROOT_URLCONF}'")
            print(f"DEBUG: Este arquivo urls.py está localizado em: {urlconf_module.__file__}")
        else:
            print("DEBUG: settings.ROOT_URLCONF não está definido!")
    except Exception as e:
        print(f"DEBUG: Erro ao tentar importar/inspecionar ROOT_URLCONF: {e}")
    # --- Fim do Bloco de Depuração ---

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()