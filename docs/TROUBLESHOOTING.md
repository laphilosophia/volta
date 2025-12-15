# Troubleshooting Guide

## Common Issues

### Component Not Rendering

**Error**: `Component type "xyz" is not registered`
**Solution**:

1. Check `src/core/component-registry/index.ts`.
2. Ensure you have called `componentRegistry.register('xyz', ...)` **before** the app requires the component.
3. Verify the type name in your metadata matches the registered name exactly.

### API Connection Failed

**Error**: `Network Error` or `CORS error`
**Solution**:

1. **CORS**: Ensure your backend server allows requests from `http://localhost:5173`. You may need to configure `Access-Control-Allow-Origin` on your server.
2. **Proxy**: If you cannot change backend CORS settings, configure a proxy in `vite.config.ts`.
3. **Endpoint**: Verify the URL in `voltaboard.config.ts`. Use the "Test Connection" button in the Designer's Data Source editor to verify.

### Type Errors in Editor

**Error**: `Property 'x' does not exist on type 'y'`
**Solution**:

1. Run `npm run type-check` to see detailed errors.
2. Ensure you are using the correct interfaces (`ComponentMetadata`, `DataSourceConfig`) from `src/core/types`.

## Debugging Tips

- **Network Tab**: Always check the browser's Network tab (F12 > Network) to see the actual API requests and responses.
- **Console**: Check the Console tab for React warnings or errors.
- **React DevTools**: Use React DevTools to inspect component props and state.

## FAQ

**Q: Can I use Redux/Zustand?**
A: Yes, you can use any state management library within your custom components. Volta uses internal stores for its own state but doesn't restrict your choices.

**Q: How do I deploy?**
A: Run `npm run build` to generate static files in `dist/`. You can host these files on any static site host (Vercel, Netlify, S3, Nginx).
