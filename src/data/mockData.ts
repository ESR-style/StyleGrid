export const generateMockData = (count: number = 1000) => {
  const companies = [
    'Apple Inc.', 'Microsoft Corporation', 'Google LLC', 'Amazon.com Inc.', 'Meta Platforms Inc.',
    'Tesla Inc.', 'Netflix Inc.', 'Adobe Inc.', 'Salesforce Inc.', 'Oracle Corporation',
    'IBM Corporation', 'Intel Corporation', 'Cisco Systems', 'PayPal Holdings', 'Zoom Video',
    'Shopify Inc.', 'Square Inc.', 'Spotify Technology', 'Uber Technologies', 'Airbnb Inc.'
  ];

  const countries = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Japan', 'Australia', 'India', 'China', 'Brazil'];
  const departments = ['Engineering', 'Sales', 'Marketing', 'Finance', 'HR', 'Operations', 'Legal', 'Product'];
  const positions = ['Manager', 'Senior', 'Junior', 'Lead', 'Director', 'VP', 'Analyst', 'Specialist'];
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Emily', 'James', 'Anna'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

  const data = [];

  for (let i = 0; i < count; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    const department = departments[Math.floor(Math.random() * departments.length)];
    const position = positions[Math.floor(Math.random() * positions.length)];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    data.push({
      id: i + 1,
      name: `${firstName} ${lastName}`,
      company,
      country,
      department,
      position,
  status: ['On Hold', 'In Transit', 'Completed', 'To Do'][Math.floor(Math.random()*4)],
      salary: Math.floor(Math.random() * 150000) + 50000,
      age: Math.floor(Math.random() * 40) + 25,
      experience: Math.floor(Math.random() * 20) + 1,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      startDate: new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      bonus: Math.floor(Math.random() * 20000) + 5000,
      rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
      active: Math.random() > 0.1,
      projects: Math.floor(Math.random() * 15) + 1,
      revenue: Math.floor(Math.random() * 500000) + 100000,
      cost: Math.floor(Math.random() * 100000) + 20000,
      profit: 0, // Will be calculated
      margin: 0, // Will be calculated
      quarter: `Q${Math.floor(Math.random() * 4) + 1}`,
      year: 2020 + Math.floor(Math.random() * 5),
      region: country === 'USA' || country === 'Canada' ? 'North America' : 
              country === 'UK' || country === 'Germany' || country === 'France' ? 'Europe' :
              country === 'Japan' || country === 'China' || country === 'India' ? 'Asia' :
              country === 'Australia' ? 'Oceania' : 'South America',
      team: department + ' Team ' + String.fromCharCode(65 + Math.floor(Math.random() * 3)), // A, B, or C
    });
  }

  // Calculate profit and margin
  data.forEach(row => {
    row.profit = row.revenue - row.cost;
    row.margin = parseFloat(((row.profit / row.revenue) * 100).toFixed(2));
  });

  return data;
};

export const mockColumnDefs = [
  {
    field: 'status',
    headerName: 'Status',
    width: 110,
    sortable: true,
    filter: true,
    filterType: 'set' as const,
    resizable: true,
    enableRowGroup: true,
    cellRenderer: (params: any) => {
      const colorMap: Record<string,string> = {
        'On Hold': 'bg-yellow-100 text-yellow-800',
        'In Transit': 'bg-blue-100 text-blue-800',
        'Completed': 'bg-green-100 text-green-800',
        'To Do': 'bg-gray-100 text-gray-800'
      };
      const cls = colorMap[params.value] || 'bg-gray-100 text-gray-800';
      return `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${cls}">${params.value}</span>`;
    }
  },
  {
    field: 'name',
    headerName: 'Employee Name',
    width: 150,
    pinned: 'left' as const,
    checkboxSelection: true,
    headerCheckboxSelection: true,
    sortable: true,
    filter: true,
    filterType: 'text' as const,
    resizable: true,
    enableRowGroup: true,
  },
  {
    field: 'company',
    headerName: 'Company',
    width: 140,
    sortable: true,
    filter: true,
    filterType: 'set' as const,
    resizable: true,
    enableRowGroup: true,
    enablePivot: true,
  },
  {
    field: 'department',
    headerName: 'Department',
    width: 120,
    sortable: true,
    filter: true,
    filterType: 'set' as const,
    resizable: true,
    enableRowGroup: true,
    enablePivot: true,
  },
  {
    field: 'position',
    headerName: 'Position',
    width: 110,
    sortable: true,
    filter: true,
    filterType: 'set' as const,
    resizable: true,
    enableRowGroup: true,
  },
  {
    field: 'country',
    headerName: 'Country',
    width: 100,
    sortable: true,
    filter: true,
    filterType: 'set' as const,
    resizable: true,
    enableRowGroup: true,
    enablePivot: true,
  },
  {
    field: 'region',
    headerName: 'Region',
    width: 120,
    sortable: true,
    filter: true,
    filterType: 'set' as const,
    resizable: true,
    enableRowGroup: true,
    enablePivot: true,
  },
  {
    field: 'team',
    headerName: 'Team',
    width: 130,
    sortable: true,
    filter: true,
    filterType: 'set' as const,
    resizable: true,
    enableRowGroup: true,
  },
  {
    field: 'salary',
    headerName: 'Salary',
    width: 100,
    sortable: true,
    filter: true,
    filterType: 'number' as const,
    resizable: true,
    enableValue: true,
    aggregationFunction: 'sum' as const,
    valueFormatter: (params: any) => `$${params.value?.toLocaleString() || '0'}`,
  },
  {
    field: 'bonus',
    headerName: 'Bonus',
    width: 100,
    sortable: true,
    filter: true,
    filterType: 'number' as const,
    resizable: true,
    enableValue: true,
    aggregationFunction: 'sum' as const,
    valueFormatter: (params: any) => `$${params.value?.toLocaleString() || '0'}`,
  },
  {
    field: 'revenue',
    headerName: 'Revenue',
    width: 110,
    sortable: true,
    filter: true,
    filterType: 'number' as const,
    resizable: true,
    enableValue: true,
    aggregationFunction: 'sum' as const,
    valueFormatter: (params: any) => `$${params.value?.toLocaleString() || '0'}`,
  },
  {
    field: 'cost',
    headerName: 'Cost',
    width: 100,
    sortable: true,
    filter: true,
    filterType: 'number' as const,
    resizable: true,
    enableValue: true,
    aggregationFunction: 'sum' as const,
    valueFormatter: (params: any) => `$${params.value?.toLocaleString() || '0'}`,
  },
  {
    field: 'profit',
    headerName: 'Profit',
    width: 100,
    sortable: true,
    filter: true,
    filterType: 'number' as const,
    resizable: true,
    enableValue: true,
    aggregationFunction: 'sum' as const,
    valueFormatter: (params: any) => `$${params.value?.toLocaleString() || '0'}`,
    cellClass: (params: any) => params.value > 0 ? 'text-green-600' : 'text-red-600' as any,
  },
  {
    field: 'margin',
    headerName: 'Margin %',
    width: 100,
    sortable: true,
    filter: true,
    filterType: 'number' as const,
    resizable: true,
    enableValue: true,
    aggregationFunction: 'avg' as const,
    valueFormatter: (params: any) => `${params.value || '0'}%`,
  },
  {
    field: 'age',
    headerName: 'Age',
    width: 80,
    sortable: true,
    filter: true,
    filterType: 'number' as const,
    resizable: true,
    enableValue: true,
    aggregationFunction: 'avg' as const,
  },
  {
    field: 'experience',
    headerName: 'Experience',
    width: 100,
    sortable: true,
    filter: true,
    filterType: 'number' as const,
    resizable: true,
    enableValue: true,
    aggregationFunction: 'avg' as const,
    valueFormatter: (params: any) => `${params.value || 0} years`,
  },
  {
    field: 'projects',
    headerName: 'Projects',
    width: 90,
    sortable: true,
    filter: true,
    filterType: 'number' as const,
    resizable: true,
    enableValue: true,
    aggregationFunction: 'sum' as const,
  },
  {
    field: 'rating',
    headerName: 'Rating',
    width: 80,
    sortable: true,
    filter: true,
    filterType: 'number' as const,
    resizable: true,
    enableValue: true,
    aggregationFunction: 'avg' as const,
    cellRenderer: (params: any) => {
      const rating = parseFloat(params.value);
      const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
      return `<span title="${rating}">${stars}</span>`;
    },
  },
  {
    field: 'quarter',
    headerName: 'Quarter',
    width: 90,
    sortable: true,
    filter: true,
    filterType: 'set' as const,
    resizable: true,
    enableRowGroup: true,
    enablePivot: true,
  },
  {
    field: 'year',
    headerName: 'Year',
    width: 80,
    sortable: true,
    filter: true,
    filterType: 'set' as const,
    resizable: true,
    enableRowGroup: true,
    enablePivot: true,
  },
  {
    field: 'startDate',
    headerName: 'Start Date',
    width: 120,
    sortable: true,
    filter: true,
    filterType: 'date' as const,
    resizable: true,
    valueFormatter: (params: any) => params.value ? new Date(params.value).toLocaleDateString() : '',
  },
  {
    field: 'email',
    headerName: 'Email',
    width: 200,
    sortable: true,
    filter: true,
    filterType: 'text' as const,
    resizable: true,
    cellRenderer: (params: any) => `<a href="mailto:${params.value}" class="text-blue-600 hover:underline">${params.value}</a>`,
  },
  {
    field: 'phone',
    headerName: 'Phone',
    width: 140,
    sortable: true,
    filter: true,
    filterType: 'text' as const,
    resizable: true,
  },
  {
    field: 'active',
    headerName: 'Active',
    width: 80,
    sortable: true,
    filter: true,
    filterType: 'set' as const,
    resizable: true,
    cellRenderer: (params: any) => 
      `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        params.value 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }">
        ${params.value ? 'Active' : 'Inactive'}
      </span>`,
  },
];
