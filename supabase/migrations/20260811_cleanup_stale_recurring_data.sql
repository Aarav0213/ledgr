-- Normalize legacy recurring suffixes that were injected into merchant names.
update public.transactions
set
  merchant_name = regexp_replace(merchant_name, '(\s*recurring)+\s*$', '', 'i'),
  merchant_normalized = case
    when merchant_normalized is null then null
    else regexp_replace(merchant_normalized, '(\s*recurring)+\s*$', '', 'i')
  end,
  is_recurring = false
where merchant_name ~* '(\s*recurring)+\s*$';

update public.subscriptions
set
  merchant_name = regexp_replace(merchant_name, '(\s*recurring)+\s*$', '', 'i'),
  status = 'cancelled'
where
  merchant_name ~* '(\s*recurring)+\s*$'
  or (
    status = 'active'
    and next_renewal_date is not null
    and next_renewal_date < current_date - case
      when billing_cycle = 'weekly' then make_interval(days => 14)
      when billing_cycle = 'biweekly' then make_interval(days => 21)
      when billing_cycle = 'monthly' then make_interval(days => 45)
      when billing_cycle = 'quarterly' then make_interval(days => 120)
      when billing_cycle = 'yearly' then make_interval(days => 420)
      else make_interval(days => 45)
    end
  );
