from django import template

register = template.Library()

@register.filter
def page_name(dictionary, key):
    return dictionary.get(key, "Unknown page")