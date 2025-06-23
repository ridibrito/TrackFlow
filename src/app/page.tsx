import Image from 'next/image';

const Logo = () => (
  <Link href="/" className="flex items-center space-x-2">
    <Image
      src="/logo_tagMage.png"
      alt="Tag Mage Logo"
      width={140}
      height={35}
      className="w-auto h-auto"
      priority
    />
  </Link>
);

<footer className="bg-gray-900 text-white py-12">
  <div className="container mx-auto px-6">
    <div className="flex flex-col md:flex-row justify-between items-center">
      <Image
        src="/logo_branca.png"
        alt="Tag Mage Logo Branca"
        width={140}
        height={35}
        className="w-auto h-auto"
        priority
      />
      // ... existing code ...
    </div>
  </div>
</footer> 