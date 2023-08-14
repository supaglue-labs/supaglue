export async function getServerSideProps() {
  return {
    redirect: {
      destination: './data_model/entities',
      permanent: false,
    },
  };
}

export default async function Home() {
  return null;
}
