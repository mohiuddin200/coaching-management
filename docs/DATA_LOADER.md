# DataLoader Component Usage Guide

The `DataLoader` component is a simple, reusable loading indicator that you can use throughout your application when data is being fetched from the database.

## Components

The package provides three loading components:

### 1. `DataLoader` (Main Component)

A flexible loader with customizable size and optional text.

**Props:**

- `size?: "sm" | "default" | "lg"` - Size of the spinner (default: "default")
- `text?: string` - Optional text to display below the spinner
- `centered?: boolean` - Whether to center the loader (default: true)
- `className?: string` - Additional CSS classes for the container
- `spinnerClassName?: string` - Additional CSS classes for the spinner

### 2. `InlineLoader`

A compact inline loader for use within components.

**Props:**

- `text?: string` - Optional text to display next to the spinner
- `className?: string` - Additional CSS classes

### 3. `FullPageLoader`

A full-page loader that covers the entire viewport.

**Props:**

- `text?: string` - Optional text to display below the spinner
- `className?: string` - Additional CSS classes

## Usage Examples

### Basic Usage

```tsx
import { DataLoader } from "@workspace/ui/components/data-loader";

function MyComponent() {
  const data = useQuery(api.myQuery);

  if (!data) {
    return <DataLoader />;
  }

  return <div>{/* Your content */}</div>;
}
```

### With Custom Text

```tsx
import { DataLoader } from "@workspace/ui/components/data-loader";

function MyComponent() {
  const data = useQuery(api.myQuery);

  if (!data) {
    return <DataLoader text="Loading your data..." />;
  }

  return <div>{/* Your content */}</div>;
}
```

### Different Sizes

```tsx
import { DataLoader } from "@workspace/ui/components/data-loader";

// Small loader
<DataLoader size="sm" text="Loading..." />

// Default loader
<DataLoader size="default" text="Loading..." />

// Large loader
<DataLoader size="lg" text="Loading..." />
```

### Inline Loader (for buttons, cards, etc.)

```tsx
import { InlineLoader } from "@workspace/ui/components/data-loader";

function MyButton() {
  const [loading, setLoading] = useState(false);

  return (
    <button disabled={loading}>
      {loading ? <InlineLoader text="Saving..." /> : "Save"}
    </button>
  );
}
```

### Full Page Loader

```tsx
import { FullPageLoader } from "@workspace/ui/components/data-loader";

function MyPage() {
  const data = useQuery(api.myQuery);

  if (!data) {
    return <FullPageLoader text="Loading application..." />;
  }

  return <div>{/* Your page content */}</div>;
}
```

### Not Centered

```tsx
import { DataLoader } from "@workspace/ui/components/data-loader";

// Loader without centering (useful in specific layouts)
<DataLoader centered={false} text="Loading..." />;
```

### With Custom Styling

```tsx
import { DataLoader } from "@workspace/ui/components/data-loader";

// Custom container styling
<DataLoader
  text="Loading..."
  className="my-4 p-8 bg-muted rounded-lg"
  spinnerClassName="text-primary"
/>;
```

## Common Use Cases

### 1. Table Loading State

```tsx
import { DataLoader } from "@workspace/ui/components/data-loader";

function MyTable() {
  const data = useQuery(api.getData);

  if (!data) {
    return <DataLoader text="Loading table data..." />;
  }

  return <Table data={data} />;
}
```

### 2. Modal/Dialog Loading State

```tsx
import { DataLoader, InlineLoader } from "@workspace/ui/components/data-loader";

function MyModal({ id }: { id: string }) {
  const item = useQuery(api.getItem, { id });

  return (
    <Modal>
      <ModalContent>
        {!item ? (
          <DataLoader size="sm" text="Loading details..." centered={false} />
        ) : (
          <div>{/* Modal content */}</div>
        )}
      </ModalContent>
    </Modal>
  );
}
```

### 3. Card Loading State

```tsx
import { InlineLoader } from "@workspace/ui/components/data-loader";

function MyCard() {
  const data = useQuery(api.getData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Card</CardTitle>
      </CardHeader>
      <CardContent>
        {!data ? <InlineLoader text="Loading..." /> : <div>{data.content}</div>}
      </CardContent>
    </Card>
  );
}
```

### 4. Form Submission Loading

```tsx
import { InlineLoader } from "@workspace/ui/components/data-loader";

function MyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <InlineLoader text="Submitting..." /> : "Submit"}
      </Button>
    </form>
  );
}
```

### 5. Page-Level Loading

```tsx
import { FullPageLoader } from "@workspace/ui/components/data-loader";

export default function MyPage() {
  const data = useQuery(api.getPageData);

  if (!data) {
    return <FullPageLoader text="Loading page..." />;
  }

  return <div>{/* Page content */}</div>;
}
```

## Best Practices

1. **Always provide meaningful text** - Help users understand what's loading

   ```tsx
   // Good
   <DataLoader text="Loading your messages..." />

   // Avoid
   <DataLoader text="Loading..." />
   ```

2. **Choose the right size** - Match the loader size to the context
   - Use `sm` for inline elements, buttons, or small cards
   - Use `default` for most components and sections
   - Use `lg` for full-page or prominent loading states

3. **Use InlineLoader for compact spaces** - When you need a loader that doesn't take up much space

   ```tsx
   <InlineLoader text="Saving..." />
   ```

4. **Use FullPageLoader sparingly** - Only for initial page loads or critical operations

   ```tsx
   <FullPageLoader text="Loading application..." />
   ```

5. **Consider accessibility** - The component includes proper ARIA labels automatically

## Migration from Old Loading States

### Before

```tsx
if (!data) {
  return <div>Loading...</div>;
}
```

### After

```tsx
import { DataLoader } from "@workspace/ui/components/data-loader";

if (!data) {
  return <DataLoader text="Loading data..." />;
}
```

## TypeScript Support

All components are fully typed with TypeScript, providing autocomplete and type checking for all props.

```tsx
import {
  DataLoader,
  InlineLoader,
  FullPageLoader,
} from "@workspace/ui/components/data-loader";

// TypeScript will provide autocomplete for all props
<DataLoader
  size="lg" // Autocomplete: "sm" | "default" | "lg"
  text="Loading..." // string
  centered={true} // boolean
/>;
```
