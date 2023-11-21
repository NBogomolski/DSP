import Image from 'next/image'
import Link from 'next/link';
import { Button } from 'antd';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Link href="/image">
        <Button type='primary' size='large' className='m-5'>Image Processing</Button>
      </Link>
      <Link href="/charts">
        <Button type='primary' size='large' className='m-5'>Charts</Button>
      </Link>
    </main>
  );
}
