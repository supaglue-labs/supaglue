export async function getServerSideProps() {
  return {
    redirect: {
      destination: './syncs/syncs',
      permanent: false,
    },
  };
}

export default async function Home() {
  return null;
}
