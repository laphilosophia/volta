import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type DefaultValues, type Path } from 'react-hook-form';
import { z } from 'zod';
import { useVoltaMutation } from '../../../hooks/useVoltaMutation';

interface ActionFormProps<T extends z.ZodObject<z.ZodRawShape>> {
  endpoint: string;
  schema: T;
  defaultValues?: Partial<z.infer<T>>;
  onSuccess?: (data: unknown) => void;
  title?: string;
}

export function ActionForm<T extends z.ZodObject<z.ZodRawShape>>({
  endpoint,
  schema,
  defaultValues,
  onSuccess,
  title,
}: ActionFormProps<T>) {
  type FormData = z.infer<T>;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues as DefaultValues<FormData>,
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const mutation = useVoltaMutation<unknown, FormData>(endpoint, {
    onSuccess: (data) => {
      onSuccess?.(data);
    },
  });

  // Simple field generation based on schema shape (naive implementation for demo)
  // In a real world scenario, we would parse the Zod schema more robustly or use a 'fields' prop.
  // For this prototype, we'll assume the schema is a simple ZodObject.
  const shape = schema.shape;

  return (
    <div className="p-6 border border-(--color-border) rounded-lg bg-(--color-surface)">
      {title && <h3 className="text-lg font-semibold mb-4 text-(--color-text-primary)">{title}</h3>}

      {mutation.error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm">
          {(mutation.error as Error).message}
        </div>
      )}

      {mutation.isSuccess && (
        <div className="mb-4 p-3 bg-green-50 text-green-600 rounded text-sm">
          Action completed successfully!
        </div>
      )}

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        {Object.keys(shape).map((key) => {
          const fieldName = key as Path<FormData>;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fieldError = (errors as any)[fieldName];
          return (
            <div key={fieldName}>
              <label className="block text-sm font-medium text-(--color-text-secondary) mb-1 capitalize">
                {fieldName}
              </label>
              <input
                {...register(fieldName)}
                className={`
                            w-full px-3 py-2 rounded-md border bg-(--color-background) text-(--color-text-primary)
                            focus:ring-2 focus:ring-(--color-primary) focus:border-transparent outline-none transition-all
                            ${fieldError ? 'border-red-500' : 'border-(--color-border)'}
                        `}
              />
              {fieldError && (
                <p className="mt-1 text-xs text-red-500">{fieldError.message as string}</p>
              )}
            </div>
          );
        })}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full py-2 px-4 bg-(--color-primary) text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {mutation.isPending ? 'Processing...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
