#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
    openslides.agenda.forms
    ~~~~~~~~~~~~~~~~~~~~~~~

    Forms for the agenda app.

    :copyright: 2011 by the OpenSlides team, see AUTHORS.
    :license: GNU GPL, see LICENSE for more details.
"""

from django.forms import Form, ModelForm, IntegerField, ChoiceField, \
                         ModelChoiceField, HiddenInput, Select
from django.utils.translation import ugettext as _
from openslides.agenda.models import Item

class ItemFormText(ModelForm):
    error_css_class = 'error'
    required_css_class = 'required'

    items = Item.objects.all().filter(parent=None)
    parent = ModelChoiceField(queryset=items, label=_("Parent item"), required=False)
    class Meta:
        model = Item
        exclude = ('closed', 'weight')


def genweightchoices():
    l = []
    for i in range(-50, 51):
        l.append(('%d' % i, i))
    return l


class ItemOrderForm(Form):
    weight = ChoiceField(choices=genweightchoices(),
                         widget=Select(attrs={'class': 'menu-weight'}),
                         label="")
    self = IntegerField(widget=HiddenInput(attrs={'class': 'menu-mlid'}))
    parent = IntegerField(widget=HiddenInput(attrs={'class': 'menu-plid'}))
