"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CommercialPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/commercial/registration-fee');
  }, [router]);
  return null;
}
