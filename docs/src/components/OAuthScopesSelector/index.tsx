import React, { useState } from 'react';

function ScopesPicker() {
  const [selectedScopes, setSelectedScopes] = useState([]);

  const scopesData = [
    {
      category: 'Required for CRM',
      scopes: {
        'crm.objects.owners': ['Read'],
        'crm.objects.companies': ['Read', 'Write'],
        'crm.lists': ['Read', 'Write'],
        'crm.objects.deals': ['Read', 'Write'],
        'crm.objects.contacts': ['Read', 'Write'],
        'crm.objects.custom': ['Read', 'Write'],
        'crm.schemas.custom': ['Read', 'Write'],
      },
    },
    {
      category: 'Required for Forms',
      scopes: {
        forms: ['Use'],
      },
    },
    {
      category: 'Other Common Scopes',
      scopes: {
        // Add other common scopes here, for now it's an example
        'other.scope.example': ['Use'],
      },
    },
  ];

  const handleScopeChange = (scope, permission, isChecked) => {
    const fullScope = `${scope}.${permission.toLowerCase()}`;
    if (isChecked) {
      setSelectedScopes((prev) => [...prev, fullScope]);
    } else {
      setSelectedScopes((prev) => prev.filter((s) => s !== fullScope));
    }
  };

  return (
    <div className="scopes-picker">
      <textarea readOnly value={selectedScopes.join(',')} rows={10} cols={50} />

      {scopesData.map((category) => (
        <div key={category.category} className="category-section">
          <h4>{category.category}</h4>
          <table>
            <thead>
              <tr>
                <th>Scope</th>
                <th>Read</th>
                <th>Write</th>
                <th>Use</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(category.scopes).map(([scope, permissions]) => (
                <tr key={scope}>
                  <td>{scope}</td>
                  <td>
                    <input
                      type="checkbox"
                      disabled={!permissions.includes('Read')}
                      onChange={(e) => handleScopeChange(scope, 'Read', e.target.checked)}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      disabled={!permissions.includes('Write')}
                      onChange={(e) => handleScopeChange(scope, 'Write', e.target.checked)}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      disabled={!permissions.includes('Use')}
                      onChange={(e) => handleScopeChange(scope, 'Use', e.target.checked)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default ScopesPicker;
