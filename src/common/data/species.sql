select ttl.id as taxa_taxon_list_id, ttl.taxon_meaning_id, ttl.taxon_id,t.external_key, t.taxon,
  (select string_agg(ttla.caption || '=' || t.term, ' | ' order by ttla.caption) 
   from taxa_taxon_list_attributes ttla
   join taxa_taxon_list_attribute_values ttlav on ttlav.taxa_taxon_list_id=ttl.id and ttlav.taxa_taxon_list_attribute_id=ttla.id
   join cache_termlists_terms t on t.id=ttlav.int_value)
from taxa_taxon_lists ttl
join taxa t on t.id=ttl.taxon_id
where ttl.taxon_list_id=251
order by ttl.taxonomic_sort_order nulls first;