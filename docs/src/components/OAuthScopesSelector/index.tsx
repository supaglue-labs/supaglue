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
        'crm.objects.quotes': ['Read', 'Write'],
        'crm.objects.line_items': ['Read', 'Write'],
        'crm.objects.custom': ['Read', 'Write'],
        'crm.schemas.custom': ['Read', 'Write'],
        'crm.schemas.companies': ['Read', 'Write'],
        'crm.schemas.contacts': ['Read', 'Write'],
        'crm.schemas.deals': ['Read', 'Write'],
        'crm.schemas.line_items': ['Read', 'Write'],
        'crm.schemas.quotes': ['Read'],
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
        timeline: ['Use'],
        tickets: ['Use'],
      },
    },
  ];

  const handleScopeChange = (scope, permissionOrChecked, isChecked = null) => {
    let fullScope = scope;
    if (isChecked !== null) {
      const permission = permissionOrChecked.toLowerCase();
      if (permission) {
        // check if permission is not an empty string
        fullScope += `.${permission}`;
      }
    }
    if (isChecked === null ? permissionOrChecked : isChecked) {
      setSelectedScopes((prev) => [...prev, fullScope]);
    } else {
      setSelectedScopes((prev) => prev.filter((s) => s !== fullScope));
    }
  };

  return (
    <div>
      <textarea className="scopes-output" readOnly value={selectedScopes.join(',')} rows={10} cols={50} />
      {scopesData.map((category) => (
        <table key={category.category}>
          <thead>
            <tr>
              <th>Scope</th>
              {['forms', 'timeline', 'tickets'].includes(Object.keys(category.scopes)[0]) ? (
                <th colSpan={2}></th>
              ) : (
                <>
                  <th>Read</th>
                  <th>Write</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {Object.entries(category.scopes).map(([scope, permissions]) => {
              const isSingleCheckboxScope = ['forms', 'timeline', 'tickets'].includes(scope);
              if (isSingleCheckboxScope) {
                return (
                  <tr key={scope}>
                    <td>{scope}</td>
                    <td colSpan={2}>
                      <input type="checkbox" onChange={(e) => handleScopeChange(scope, '', e.target.checked)} />
                    </td>
                  </tr>
                );
              } else {
                return (
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
                  </tr>
                );
              }
            })}
          </tbody>
        </table>
      ))}
    </div>
  );
}

export default ScopesPicker;