'''
Priestly Data excel to CSV

You need the openpyxl package to use this script. In terminal:
pip install openpyxl
'''

import pandas as pd

#filename = 'PriestleyBioData_Feb2_2023(2_20_2024)'
#filename = 'Chronographics Biographies(9_18_2024)'
filename = 'Chronographics Biographies(5_7_2026)'


read_file = pd.read_excel('csv/' + filename + '.xlsx', sheet_name="Data for Website (Dynamic)")


csv_selection = {"NameInIndex": read_file["NameInIndex"],
                 "UO_ID": read_file["UO_ID"],
                 #"Watkins_ID": read_file["Watkins_ID"],
                 #"Alternate_name": read_file["Alternate name"], #was Aikin
                 #"Alternate_ID": read_file["Alternate_ID"], #was Aikin

                 "Bio Name":read_file["Bio Name (from source)"],
                 "BioSource":read_file["Source"],
                 "Biography":read_file["Biography"],
                 "Citation":read_file["Citation"],
                 "Region_final": read_file["Region"],
                 "Sex or gender V2": read_file["Sex-Gender"],
                 "case": read_file["Case"], #original case
                 "VisualCase": read_file["VisualCase"], #newer for labelling and menu sorting
                 "IndexLifeCode": read_file["IndexLifeCode"],
                 "DeathPrecision": read_file["DeathPrecision"],
                 "DeathDate": read_file["DeathDate"],
                 "BornPrecision": read_file["BornPrecision"],
                 "BirthDate": read_file["BirthDate"],
                 "Alive precision": read_file["Alive precision"],
                 "AliveDate": read_file["AliveDate"],
                 "LifeLength Precision": read_file["LifeLength Precision"],
                 "LifeLength": read_file["LifeLength"],
                 "aproxBirthDate": read_file["approxBirthDate"], 
                 "aproxDeathDate": read_file["approxDeathDate"],
                 "Index Category 1": read_file["Index Category 1"],
                 "NameOnChart": read_file["NameOnChart"],
                 "OnChartCategory": read_file["OnChartCategory"],
                 "On Chart: Line #": read_file["Chart Line #"],
                 "Section starting Line": read_file["Section starting Line"],
                 "LineNumber": read_file["LineNumber"],
                 "FullTextPageNum": read_file["FullTextPageNum"],
                 #"WikiLink in MM10?": read_file["WikiLink in MM10?"],
                 "WikiLink": read_file["WikiLink"]
                 #"Alternate Link": read_file["Alternate Link"], note = missing from chronographics, will need to add back in
                 #"country": read_file["wiki country"], note = missing from chronographics, will need to add back in
                 #"continent": read_file["wiki continent"], note = missing from chronographics, will need to add back in
                 #"discrepancy": read_file["Discrepancy Category 1"] note = missing from chronographics, will need to add back in

                 }

#only return fields listed
csv_make = pd.DataFrame(csv_selection)


#remove periods from the professions (Index category)
csv_make['Index Category 1'] = csv_make['Index Category 1'].str.replace('.', '')

#filter out rows
#csv_make = csv_make[not csv_make['discrepancy'].isin([1800,"NC"])] #& (csv_make['reading score'] <= 75)]
#csv_make = csv_make.loc[~csv_make['discrepancy'].isin([1800,"NC"])] #not in 1800

csv_make.to_csv('csv/' + filename + '.csv', encoding = 'utf-8', index = None, header = True)

print("Complete")
