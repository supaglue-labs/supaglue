export async function getServerSideProps() {
  return {
    redirect: {
      destination: './connectors/providers',
      permanent: false,
    },
  };
}

export default async function Home() {
  return null;
}
