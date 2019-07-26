#!/usr/bin/python

# Transforms a CSV file into a JSON file
# eg.
# A, B, C[], C[], C[], D[], E{A}, E{B}
#
# {A, B, [C, C, C], [D], E:{A, B}}
import logging
logging.basicConfig(filename='warnings.log', level=logging.DEBUG)

import csv
import json
import copy

import pdb


OUTPUT_TAXON_ID = 1
INPUT_TAXON_ID = OUTPUT_TAXON_ID
with open('./names.json', 'r') as f:
  names = json.load(f)


def split_row(row):
    data = []
    # for each column in row
    for col in row:
        if col:  # don't add empty
            try:
                col = int(col)  # try parsing an integer
            except ValueError:
                col = col
            data.append(col)
    return data


def find_genus(row_data, data):
    genus = False
    # find genus for current row
    if len(data) != 0:
        i = len(data) - 1  # get last one
        # traverse backwards looking for genus array
        while i >= 0:
            prev_row = data[i]
            taxon = prev_row[OUTPUT_TAXON_ID].split()
            # has only one word that matches
            if len(taxon) == 1 and taxon[0] == row_data[INPUT_TAXON_ID].split()[0]:
                # check if same informal group
                genus = prev_row  # current row_data will be attached to this one
                i = i - 1
            else:
                break
    return genus

carry_over_country_prefix = ''
def add_to_genus(genus, row_data):
    if (len(row_data[2].split()) == 1):
        logging.debug('Warning! Adding genus to genus: ' + row_data[2])
        return

    # remove genus from species name
    row_data[1] = row_data[1].split(' ', 1)[1]

    row_data[2] = row_data[2].split(' ')

    def parse_abundance(abundance):
        global carry_over_country_prefix
        parsed_abundance = {}
        split_abundance = abundance.split('=')
        key = split_abundance[0]
        if len(split_abundance) != 2:
          carry_over_country_prefix = split_abundance[0]
          return None

        if carry_over_country_prefix:
          key = f'{carry_over_country_prefix}_{key}'
          carry_over_country_prefix = ''
        val = split_abundance[1]
        parsed_abundance[key] = val
        return parsed_abundance


    row_data[2] = list(filter(lambda x: x, map(parse_abundance, row_data[2])))
    # add row to genus
    english = ''
    english_names = list(filter(lambda x: (int(x['preferred_taxa_taxon_list_id']) == row_data[0] and (x['language_iso'] == 'eng')), names['data']))
    if (len(english_names) > 0) : 
      english = english_names[0]['taxon']

    swedish = ''
    swedish_names = list(filter(lambda x: (int(x['preferred_taxa_taxon_list_id']) == row_data[0] and (x['language_iso'] == 'swe')), names['data']))
    if (len(swedish_names) > 0) : 
      swedish = swedish_names[0]['taxon']

    common_names = [english, swedish]
    genus[2].append(copy.copy([*row_data, common_names]))


def process_row(data, row):
    row_data = split_row(row)

    # get last row or create one if no data translated yet
    genus = find_genus(row_data, data)
    # check if there is a genus to attach current row
    if not genus:
        # add to all row data
        genus = copy.copy(row_data)
        genus[2] = []  # del NULL for genus agg
        data.append(genus)
        return

    add_to_genus(genus, row_data)


def run(input_filename, output_filename):
    csv_file = open(input_filename, 'rt')
    reader = csv.reader(csv_file)

    # scan file
    data = []
    row_data = {}
    header = None
    for row in reader:
        if not header:
            # initial header saving
            header = row
        else:
            process_row(data, row)

    # logging.debug out
    json_file = open(output_filename, 'wt')
    json_file.write(json.dumps(data, separators=(',', ':')))
    # json_file.write(json.dumps(data, indent=4, separators=(',', ': ')))

    csv_file.close()
    json_file.close()
