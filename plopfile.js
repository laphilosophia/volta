/**
 * @param {import("plop").NodePlopAPI} plop
 */
export default function (plop) {
  // Headless Component Generator
  plop.setGenerator('headless', {
    description: 'Create a new Headless Component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component Name (e.g. DataGrid)',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/components/headless/{{pascalCase name}}/index.tsx',
        templateFile: 'plop-templates/headless/component.tsx.hbs',
      },
      {
        type: 'add',
        path: 'src/components/headless/{{pascalCase name}}/schema.ts',
        templateFile: 'plop-templates/headless/schema.ts.hbs',
      },
      {
        type: 'add',
        path: 'src/components/headless/{{pascalCase name}}/types.ts',
        templateFile: 'plop-templates/headless/types.ts.hbs',
      },
    ],
  })

  // Designer Component Generator
  plop.setGenerator('designer', {
    description: 'Create a new Designer Component Definition',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component Name (e.g. HeroSection)',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/components/designer/{{pascalCase name}}.definition.ts',
        templateFile: 'plop-templates/designer/definition.ts.hbs',
      },
    ],
  })

  // Hook Generator
  plop.setGenerator('hook', {
    description: 'Create a new Custom Hook',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Hook Name (e.g. useAuth)',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/hooks/{{camelCase name}}.ts',
        templateFile: 'plop-templates/hook/hook.ts.hbs',
      },
    ],
  })

  // Predefined Component Generator
  plop.setGenerator('predefined', {
    description: 'Create a new Predefined (UI) Component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component Name (e.g. Card)',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/components/predefined/{{pascalCase name}}.tsx',
        templateFile: 'plop-templates/predefined/component.tsx.hbs',
      },
    ],
  })
}
