#!/usr/bin/env python
# coding: utf-8

# # Publications markdown generator for academicpages
# 
# Takes a set of bibtex of publications and converts them for use with [academicpages.github.io](academicpages.github.io). This is an interactive Jupyter notebook ([see more info here](http://jupyter-notebook-beginner-guide.readthedocs.io/en/latest/what_is_jupyter.html)). 
# 
# The core python code is also in `pubsFromBibs.py`. 
# Run either from the `markdown_generator` folder after replacing updating the publist dictionary with:
# * bib file names
# * specific venue keys based on your bib file preferences
# * any specific pre-text for specific files
# * Collection Name (future feature)
# 
# TODO: Make this work with other databases of citations, 
# TODO: Merge this with the existing TSV parsing solution


import bibtexparser
from bibtexparser import customization as c
import pandas as pd
import os
import re
from time import strptime
import html
from publist import publist

def html_escape(text):
    """Produce entities within text."""
    return html.escape(str(text))

def clean_bibtex_str(s):
    """Clean BibTeX string and remove surrounding braces."""
    s = s.replace('\\','').replace('{','').replace('}','')
    return s

for pubsource in publist:
    parser = bibtexparser.bparser.BibTexParser()
    parser.customization = c.author
    
    with open(publist[pubsource]["file"], 'r', encoding='utf-8') as bibtex_file:
        bib_database = bibtexparser.load(bibtex_file, parser=parser)
    
    for entry in bib_database.entries:
        # Reset default date
        pub_year = entry.get('year', '1900')
        pub_month = entry.get('month', '01')
        pub_day = "01"
        
        # Clean and format the title
        clean_title = clean_bibtex_str(entry["title"])
        url_slug = re.sub("\\[.*\\]|[^a-zA-Z0-9_-]", "", clean_title.lower().replace(" ","-"))
        url_slug = re.sub("--+", "-", url_slug)
        
        md_filename = f"{pub_year}-{pub_month}-{pub_day}-{url_slug}.md"
        html_filename = f"{pub_year}-{pub_month}-{pub_day}-{url_slug}"
        
        # Build citation string
        citation = ""
        
        # Add authors
        for author in entry.get('author', []):
            citation += f"{author} and "
        citation = citation[:-5]  # Remove last ' and '
        
        # Add title
        citation += f'. "{clean_title}"'
        
        # Add venue
        venue_key = publist[pubsource]["venuekey"]
        venue_val = entry.get(venue_key, "")
        if venue_val:
            venue = publist[pubsource]["venue-pretext"] + clean_bibtex_str(venue_val)
            citation += f". {venue}"
        
        if 'year' in entry:
            citation += f", {entry['year']}"
        
        citation += "."
        
        # YAML front matter
        md = f"""---
title: "{clean_title}"
collection: {publist[pubsource]["collection"]["name"]}
permalink: {publist[pubsource]["collection"]["permalink"]}{html_filename}
date: {pub_year}-{pub_month}-{pub_day}
venue: '{clean_bibtex_str(venue_val)}'
"""
        
        # Add paper URL if available
        if 'url' in entry:
            md += f"paperurl: '{entry['url']}'\n"
            
        # Add DOI if available
        if 'doi' in entry:
            md += f"doi: '{entry['doi']}'\n"
            
        # Add citation
        md += f"citation: '{html_escape(citation)}'\n"
        
        # Add abstract if available
        if 'abstract' in entry:
            md += f"abstract: '{html_escape(entry['abstract'])}'\n"
            
        md += "---\n"
        
        # Add content
        if 'abstract' in entry:
            md += f"\n{entry['abstract']}\n"
            
        if 'url' in entry:
            md += f"\n[Access paper here]({entry['url']})\n"
            
        # Write the markdown file
        os.makedirs("../_publications/", exist_ok=True)
        with open(f"../_publications/{md_filename}", 'w', encoding='utf-8') as f:
            f.write(md)
            
        print(f'SUCCESSFULLY PARSED {entry.get("ID", "")}: "{clean_title}"')
