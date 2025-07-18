# Update this function in your database.py file

def get_businesses(self, search='', sort_by='scraped_date', page=1, per_page=12, filters=None):
    try:
        offset = (page - 1) * per_page
        
        # Start with base query
        query = self.supabase.table('businesses').select('*')
        
        # Apply filters first (search is disabled as per previous request)
        if filters:
            if filters.get('business_type'):
                query = query.eq('business_type', filters['business_type'])
            if filters.get('industry'):
                query = query.eq('industry', filters['industry'])
            if filters.get('company_size'):
                query = query.eq('company_size', filters['company_size'])
            if filters.get('location'):
                query = query.ilike('location', f"%{filters['location']}%")
            if filters.get('founded_year_range'):
                start_year, end_year = filters['founded_year_range']
                query = query.gte('founded_year', start_year).lte('founded_year', end_year)
        
        # Apply sorting - UPDATED: Default to recent first
        if sort_by == 'scraped_date':
            # Sort by scraped_date descending (newest first)
            query = query.order('scraped_date', desc=True)
        elif sort_by == 'company_name':
            query = query.order('company_name')
        elif sort_by == 'business_type':
            query = query.order('business_type')
        elif sort_by == 'industry':
            query = query.order('industry')
        elif sort_by == 'founded_year':
            query = query.order('founded_year', desc=True)
        else:
            # Default to recent first
            query = query.order('scraped_date', desc=True)
        
        # Build count query for pagination
        count_query = self.supabase.table('businesses').select('id', count='exact')
        
        # Apply same filters to count query
        if filters:
            if filters.get('business_type'):
                count_query = count_query.eq('business_type', filters['business_type'])
            if filters.get('industry'):
                count_query = count_query.eq('industry', filters['industry'])
            if filters.get('company_size'):
                count_query = count_query.eq('company_size', filters['company_size'])
            if filters.get('location'):
                count_query = count_query.ilike('location', f"%{filters['location']}%")
            if filters.get('founded_year_range'):
                start_year, end_year = filters['founded_year_range']
                count_query = count_query.gte('founded_year', start_year).lte('founded_year', end_year)
        
        # Execute count query
        total_result = count_query.execute()
        total = total_result.count
        
        # Execute main query with pagination
        result = query.range(offset, offset + per_page - 1).execute()
        total_pages = (total + per_page - 1) // per_page
        
        return {
            "success": True,
            "data": result.data,
            "pagination": {
                "current_page": page,
                "per_page": per_page,
                "total_items": total,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1
            }
        }
        
    except Exception as e:
        print(f"❌ Database query error: {e}")
        return {"success": False, "error": str(e)}