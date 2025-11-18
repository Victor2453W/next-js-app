'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import bcryptjs from 'bcryptjs';
import postgres from 'postgres'

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
    id: z.string(), 
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce
        .number()
        .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], { 
        invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string(), 
});

const RegisterFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const UpdateInvoice = FormSchema.omit({ id: true, date: true });
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

export async function createInvoice (prevState: State, formData: FormData) {
    const validatedFields = CreateInvoice.safeParse({ 
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    
    if(!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to create Invoice.',
        };
    }

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
    try{
        await sql`
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;
    }
    catch(error){
        return {
            message: 'Database Error: Failed to Create Invoice.',
        };
    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, prevState: State, formData: FormData) {
    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    if(!validatedFields.success){
        return{
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to update Invoice.',
        }
    }

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    try{
        await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}
        `;
    } catch(error){
        return {
            message: 'Database Error: Failed to Update Invoice.',
        };
    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    // throw new Error('Failed to Delete Invoice'); 
    try{
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
    }catch(error){
        console.log(error);
    }
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
  ) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                return 'Invalid credentials.';
                default:
                return 'Something went wrong.';
            }
        }
        throw error;
    }
}


export async function register(
  prevState: string | undefined,
  formData: FormData,
) {
  const validatedFields = RegisterFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return 'Missing Fields. Failed to Register.';
  }

  const { name, email, password } = validatedFields.data;

  try {
    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return 'User with this email already exists.';
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Insert new user
    await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
    `;

  } catch (error) {
    console.error('Registration Error:', error);
    return 'Database Error: Failed to register.';
  }

  // Redirect to login page after successful registration
  redirect('/login');
}

// export async function register(
//   prevState: string | undefined,
//   formData: FormData
// ): Promise<string | null> {
//   const validated = RegisterFormSchema.safeParse({
//     name:     formData.get('name') as string,
//     email:    formData.get('email') as string,
//     password: formData.get('password') as string
//   });

//   if (!validated.success) {
//     const firstError = Object.values(validated.error.flatten().fieldErrors)[0]?.[0];
//     return firstError || 'Invalid form data.';
//   }

//   const { name, email, password } = validated.data;

//   const hashedPassword = await bcryptjs.hash(password, 12);

//   try {
//     await sql`
//       INSERT INTO users (name, email, password)
//       VALUES (${name}, ${email}, ${hashedPassword})
//     `;
//   } catch (err: any) {
//     if (err.code === '23505') {
//       return 'Email is already taken.';
//     }
//     console.error(err);
//     return 'Database error while creating user.';
//   }

//   revalidatePath('/dashboard');
//   redirect('/dashboard');

//   return null;
// }